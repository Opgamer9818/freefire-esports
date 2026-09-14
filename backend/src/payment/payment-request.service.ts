import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly settings: SettingsService,
    private readonly notifications: NotificationService,
  ) {}

  async createRequest(userId: string, requestedCoins: number) {
    const pendingCount = await this.prisma.paymentRequest.count({
      where: { userId, status: 'PENDING' },
    });
    if (pendingCount >= 3) {
      throw new BadRequestException(
        'You already have payment requests awaiting review — wait for those before submitting more.',
      );
    }

    const rate = await this.settings.get<number>('coin_rate_inr');
    const upiId = await this.settings.get<string>('upi_id');

    const request = await this.prisma.paymentRequest.create({
      data: {
        userId,
        requestedCoins,
        expectedAmount: requestedCoins * rate,
        upiDestination: upiId,
        status: 'PENDING',
        idempotencyKey: `payreq:${randomUUID()}`,
      },
    });

    await this.notifications.create(
      userId,
      'PAYMENT_RECEIVED',
      'Payment request received',
      `Your request for ${requestedCoins} coins is under review.`,
    );

    return request;
  }

  async submitReference(userId: string, requestId: string, utrReference?: string, screenshotUrl?: string) {
    const req = await this.prisma.paymentRequest.findUnique({ where: { id: requestId } });
    if (!req || req.userId !== userId) throw new NotFoundException('Payment request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('This request is no longer pending');

    return this.prisma.paymentRequest.update({
      where: { id: requestId },
      data: { utrReference, screenshotUrl },
    });
  }

  async myRequests(userId: string) {
    return this.prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------- Admin ----------------

  async listPending() {
    return this.prisma.paymentRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { user: { include: { profile: true } } },
    });
  }

  async approve(requestId: string, adminId: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.paymentRequest.findUnique({ where: { id: requestId } });
      if (!req) throw new NotFoundException('Payment request not found');
      if (req.status !== 'PENDING') throw new BadRequestException('This request was already resolved');

      await this.walletService.credit(
        {
          userId: req.userId,
          type: 'COIN_PURCHASE',
          amount: req.requestedCoins,
          idempotencyKey: `payreq-approve:${req.id}`,
          reference: req.id,
          description: 'Coin purchase approved',
          createdByAdminId: adminId,
        },
        tx,
      );

      const updated = await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'PAYMENT_APPROVED',
          targetType: 'PaymentRequest',
          targetId: requestId,
          reason: note,
        },
      });

      await this.notifications.create(
        req.userId,
        'COINS_CREDITED',
        'Coins credited',
        `${req.requestedCoins} coins have been added to your wallet.`,
        tx,
      );

      return updated;
    });
  }

  async reject(requestId: string, adminId: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.paymentRequest.findUnique({ where: { id: requestId } });
      if (!req) throw new NotFoundException('Payment request not found');
      if (req.status !== 'PENDING') throw new BadRequestException('This request was already resolved');

      const updated = await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'PAYMENT_REJECTED',
          targetType: 'PaymentRequest',
          targetId: requestId,
          reason: note,
        },
      });

      await this.notifications.create(
        req.userId,
        'PAYMENT_REJECTED',
        'Payment request rejected',
        note ?? 'Your payment request could not be verified.',
        tx,
      );

      return updated;
    });
  }
}
