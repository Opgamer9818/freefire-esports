import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async list(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { profile: { ffIgn: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: { profile: true, wallet: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async ban(userId: string, adminId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { isBanned: true } });
      await tx.ban.create({ data: { userId, reason, bannedByAdminId: adminId, active: true } });
      await tx.adminAction.create({
        data: { adminId, action: 'USER_BANNED', targetType: 'User', targetId: userId, reason },
      });
      await this.notifications.create(userId, 'ACCOUNT_BAN', 'Account restricted', reason, tx);
    });
  }

  async unban(userId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { isBanned: false } });
      await tx.ban.updateMany({ where: { userId, active: true }, data: { active: false } });
      await tx.adminAction.create({
        data: { adminId, action: 'USER_UNBANNED', targetType: 'User', targetId: userId },
      });
      await this.notifications.create(
        userId,
        'ACCOUNT_UNBAN',
        'Account restored',
        'Your account restriction has been lifted.',
        tx,
      );
    });
  }
}
