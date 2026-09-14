import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';
import { TournamentFormDto } from './dto/tournament-form.dto';

@Injectable()
export class AdminTournamentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly notifications: NotificationService,
  ) {}

  async listAll() {
    return this.prisma.tournament.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async create(dto: TournamentFormDto, adminId: string) {
    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        format: dto.format as any,
        teamSize: dto.teamSize,
        isFree: dto.isFree,
        entryFeeCoins: dto.isFree ? 0 : dto.entryFeeCoins,
        prizePool: dto.prizePool,
        slots: dto.slots,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        registrationOpenAt: new Date(dto.registrationOpenAt),
        registrationCloseAt: new Date(dto.registrationCloseAt),
        rules: dto.rules,
        status: (dto.status as any) ?? 'DRAFT',
        createdByAdminId: adminId,
      },
    });

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'TOURNAMENT_CREATED',
        targetType: 'Tournament',
        targetId: tournament.id,
        afterJson: tournament as any,
      },
    });

    return tournament;
  }

  async update(id: string, dto: TournamentFormDto, adminId: string) {
    const before = await this.get(id);

    const tournament = await this.prisma.tournament.update({
      where: { id },
      data: {
        name: dto.name,
        format: dto.format as any,
        teamSize: dto.teamSize,
        isFree: dto.isFree,
        entryFeeCoins: dto.isFree ? 0 : dto.entryFeeCoins,
        prizePool: dto.prizePool,
        slots: dto.slots,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        registrationOpenAt: new Date(dto.registrationOpenAt),
        registrationCloseAt: new Date(dto.registrationCloseAt),
        rules: dto.rules,
        status: (dto.status as any) ?? before.status,
      },
    });

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'TOURNAMENT_UPDATED',
        targetType: 'Tournament',
        targetId: id,
        beforeJson: before as any,
        afterJson: tournament as any,
      },
    });

    return tournament;
  }

  // Cancelling refunds every paid, still-confirmed registration —
  // idempotent (registrations already REFUNDED are skipped), so cancelling
  // twice can't double-refund.
  async cancel(tournamentId: string, adminId: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) throw new NotFoundException('Tournament not found');
      if (tournament.status === 'CANCELLED') {
        throw new BadRequestException('This tournament is already cancelled');
      }

      const registrations = await tx.tournamentRegistration.findMany({
        where: { tournamentId, status: 'CONFIRMED' },
      });

      for (const reg of registrations) {
        if (reg.entryFeePaid > 0) {
          await this.walletService.credit(
            {
              userId: reg.userId,
              type: 'REFUND',
              amount: reg.entryFeePaid,
              idempotencyKey: `refund:${tournamentId}:${reg.userId}`,
              reference: tournamentId,
              description: `Tournament cancelled — entry fee refunded`,
              createdByAdminId: adminId,
            },
            tx,
          );
        }
        await tx.tournamentRegistration.update({
          where: { id: reg.id },
          data: { status: 'REFUNDED' },
        });

        await this.notifications.create(
          reg.userId,
          'TOURNAMENT_CANCELLED',
          'Tournament cancelled',
          reg.entryFeePaid > 0
            ? `"${tournament.name}" was cancelled. Your ${reg.entryFeePaid} coin entry fee has been refunded.`
            : `"${tournament.name}" was cancelled.`,
          tx,
        );
      }

      const updated = await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'CANCELLED' },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'TOURNAMENT_CANCELLED',
          targetType: 'Tournament',
          targetId: tournamentId,
          reason: reason ?? `Refunded ${registrations.length} registration(s)`,
        },
      });

      return updated;
    });
  }
}
