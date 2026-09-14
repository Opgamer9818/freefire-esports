import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WithdrawalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly settings: SettingsService,
    private readonly notifications: NotificationService,
  ) {}

  async requestWithdrawal(userId: string, amount: number, upiId: string, upiQrUrl?: string) {
    const min = await this.settings.get<number>('min_withdrawal');
    const max = await this.settings.get<number>('max_withdrawal');

    if (amount < min) throw new BadRequestException(`Minimum withdrawal is ${min} coins`);
    if (amount > max) throw new BadRequestException(`Maximum withdrawal is ${max} coins`);

    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.create({
        data: { userId, amount, upiId, upiQrUrl, status: 'PENDING' },
      });

      // Reserve immediately so the same balance can't also be spent on a
      // tournament entry (or a second withdrawal) while this is pending.
      await this.walletService.reserve(
        {
          userId,
          type: 'WITHDRAWAL_RESERVE',
          amount,
          idempotencyKey: `wd-reserve:${withdrawal.id}`,
          reference: withdrawal.id,
          description: 'Withdrawal requested — funds reserved',
        },
        tx,
      );

      await this.notifications.create(
        userId,
        'WITHDRAWAL_STATUS_CHANGED',
        'Withdrawal requested',
        `Your request to withdraw ${amount} coins is being reviewed.`,
        tx,
      );

      return withdrawal;
    });
  }

  async myRequests(userId: string) {
    return this.prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------- Admin ----------------

  async listActive() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
      orderBy: { createdAt: 'asc' },
      include: { user: { include: { profile: true } } },
    });
  }

  async approve(id: string, adminId: string, note?: string) {
    return this.advanceStatus(id, adminId, 'PENDING', 'APPROVED', note);
  }

  async markProcessing(id: string, adminId: string, note?: string) {
    return this.advanceStatus(id, adminId, 'APPROVED', 'PROCESSING', note);
  }

  async markPaid(id: string, adminId: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const wd = await tx.withdrawalRequest.findUnique({ where: { id } });
      if (!wd) throw new NotFoundException('Withdrawal request not found');
      if (!['APPROVED', 'PROCESSING'].includes(wd.status)) {
        throw new BadRequestException(`Cannot mark paid from status ${wd.status} — approve it first`);
      }

      await this.walletService.finalizeReservedDebit(
        {
          userId: wd.userId,
          type: 'WITHDRAWAL_DEBIT',
          amount: wd.amount,
          idempotencyKey: `wd-paid:${wd.id}`,
          reference: wd.id,
          description: 'Withdrawal paid out',
          createdByAdminId: adminId,
        },
        tx,
      );

      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'PAID', adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: { adminId, action: 'WITHDRAWAL_PAID', targetType: 'WithdrawalRequest', targetId: id, reason: note },
      });

      await this.notifications.create(
        wd.userId,
        'WITHDRAWAL_STATUS_CHANGED',
        'Withdrawal paid',
        `${wd.amount} coins have been sent to ${wd.upiId}.`,
        tx,
      );

      return updated;
    });
  }

  async reject(id: string, adminId: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const wd = await tx.withdrawalRequest.findUnique({ where: { id } });
      if (!wd) throw new NotFoundException('Withdrawal request not found');
      if (['PAID', 'REJECTED', 'CANCELLED'].includes(wd.status)) {
        throw new BadRequestException('This request is already resolved');
      }

      await this.walletService.reverseReserved(
        {
          userId: wd.userId,
          type: 'WITHDRAWAL_REVERSAL',
          amount: wd.amount,
          idempotencyKey: `wd-reject:${wd.id}`,
          reference: wd.id,
          description: 'Withdrawal rejected — funds returned',
          createdByAdminId: adminId,
        },
        tx,
      );

      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'REJECTED', adminId, adminNote: note, resolvedAt: new Date() },
      });

      await tx.adminAction.create({
        data: { adminId, action: 'WITHDRAWAL_REJECTED', targetType: 'WithdrawalRequest', targetId: id, reason: note },
      });

      await this.notifications.create(
        wd.userId,
        'WITHDRAWAL_STATUS_CHANGED',
        'Withdrawal rejected',
        note ?? `Your withdrawal of ${wd.amount} coins was rejected — the amount is back in your wallet.`,
        tx,
      );

      return updated;
    });
  }

  private async advanceStatus(
    id: string,
    adminId: string,
    fromStatus: WithdrawalStatus,
    toStatus: WithdrawalStatus,
    note?: string,
  ) {
    const wd = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!wd) throw new NotFoundException('Withdrawal request not found');
    if (wd.status !== fromStatus) {
      throw new BadRequestException(`Expected status ${fromStatus}, this request is ${wd.status}`);
    }

    const updated = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status: toStatus, adminId, adminNote: note },
    });

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: `WITHDRAWAL_${toStatus}`,
        targetType: 'WithdrawalRequest',
        targetId: id,
        reason: note,
      },
    });

    await this.notifications.create(
      wd.userId,
      'WITHDRAWAL_STATUS_CHANGED',
      'Withdrawal update',
      `Your withdrawal of ${wd.amount} coins is now ${toStatus.toLowerCase()}.`,
    );

    return updated;
  }
}
