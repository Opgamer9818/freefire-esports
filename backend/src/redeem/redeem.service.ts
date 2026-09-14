import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RedeemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly notifications: NotificationService,
  ) {}

  private normalize(code: string) {
    return code.trim().toUpperCase();
  }

  private hash(normalizedCode: string) {
    return createHash('sha256').update(normalizedCode).digest('hex');
  }

  async submitCode(userId: string, rawCode: string) {
    const normalized = this.normalize(rawCode);
    const codeHash = this.hash(normalized);

    const existing = await this.prisma.redeemRequest.findUnique({ where: { codeHash } });
    if (existing) {
      throw new BadRequestException('This code has already been submitted');
    }

    const request = await this.prisma.redeemRequest.create({
      data: { userId, code: normalized, codeHash, status: 'PENDING' },
    });

    await this.notifications.create(
      userId,
      'REDEEM_STATUS_CHANGED',
      'Redeem code received',
      'Your redeem-code request has been received. Please wait while it is checked.',
    );

    return request;
  }

  async myRequests(userId: string) {
    return this.prisma.redeemRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // Never send the raw code back to any client, including the
      // submitter, once it's stored — nothing needs to display it again.
      select: {
        id: true,
        status: true,
        approvedCoins: true,
        adminNote: true,
        createdAt: true,
        resolvedAt: true,
      },
    });
  }

  // ---------------- Admin ----------------

  async listPending() {
    return this.prisma.redeemRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { user: { include: { profile: true } } },
    });
  }

  async approve(requestId: string, adminId: string, approvedCoins: number, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.redeemRequest.findUnique({ where: { id: requestId } });
      if (!req) throw new NotFoundException('Redeem request not found');
      if (req.status !== 'PENDING') throw new BadRequestException('This request was already resolved');

      await this.walletService.credit(
        {
          userId: req.userId,
          type: 'REDEEM_CREDIT',
          amount: approvedCoins,
          idempotencyKey: `redeem-approve:${req.id}`,
          reference: req.id,
          description: 'Redeem code approved',
          createdByAdminId: adminId,
        },
        tx,
      );

      const updated = await tx.redeemRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', approvedCoins, adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'REDEEM_APPROVED',
          targetType: 'RedeemRequest',
          targetId: requestId,
          reason: note,
        },
      });

      await this.notifications.create(
        req.userId,
        'COINS_CREDITED',
        'Redeem code approved',
        `${approvedCoins} coins have been added to your wallet.`,
        tx,
      );

      return updated;
    });
  }

  async reject(requestId: string, adminId: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.redeemRequest.findUnique({ where: { id: requestId } });
      if (!req) throw new NotFoundException('Redeem request not found');
      if (req.status !== 'PENDING') throw new BadRequestException('This request was already resolved');

      const updated = await tx.redeemRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'REDEEM_REJECTED',
          targetType: 'RedeemRequest',
          targetId: requestId,
          reason: note,
        },
      });

      await this.notifications.create(
        req.userId,
        'REDEEM_STATUS_CHANGED',
        'Redeem code rejected',
        note ?? 'Your redeem code could not be verified.',
        tx,
      );

      return updated;
    });
  }
}
