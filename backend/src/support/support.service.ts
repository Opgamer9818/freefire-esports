import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async createTicket(userId: string, category: string, message: string) {
    return this.prisma.supportTicket.create({
      data: { userId, category: category as any, message, status: 'OPEN' },
    });
  }

  async myTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------- Admin ----------------

  async listAll(status?: string) {
    return this.prisma.supportTicket.findMany({
      where: status ? { status: status as SupportStatus } : undefined,
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(ticketId: string, adminResponse: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminResponse,
        status: status as SupportStatus,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : ticket.resolvedAt,
      },
    });

    await this.notifications.create(
      ticket.userId,
      'GENERAL',
      'Support ticket updated',
      adminResponse.length > 100 ? `${adminResponse.slice(0, 100)}…` : adminResponse,
    );

    return updated;
  }
}
