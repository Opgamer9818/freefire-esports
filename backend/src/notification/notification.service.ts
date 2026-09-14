import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Every other service calls this to notify a player. Writes the in-app
  // record first (that's the source of truth for the notification
  // center), then makes a best-effort push attempt — a missing/stale FCM
  // token or a push failure must never break the caller's main flow
  // (e.g. a payment approval has to succeed even if the push fails).
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    const notification = await db.notification.create({
      data: { userId, type, title, body },
    });

    this.sendPush(userId, title, body).catch(() => {
      // Intentionally swallowed — see comment above.
    });

    return notification;
  }

  private async sendPush(userId: string, title: string, body: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile?.fcmToken) return;

    await admin.messaging().send({
      token: profile.fcmToken,
      notification: { title, body },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async registerFcmToken(userId: string, token: string) {
    await this.prisma.profile.update({ where: { userId }, data: { fcmToken: token } });
    return { success: true };
  }
}
