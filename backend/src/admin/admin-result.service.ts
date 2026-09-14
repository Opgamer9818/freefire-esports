import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';
import { ResultEntryDto } from './dto/submit-results.dto';

@Injectable()
export class AdminResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly notifications: NotificationService,
  ) {}

  async getResults(tournamentId: string) {
    return this.prisma.tournamentResult.findMany({
      where: { tournamentId },
      include: { user: { include: { profile: true } } },
      orderBy: { rank: 'asc' },
    });
  }

  async getRegistrations(tournamentId: string) {
    return this.prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      include: { user: { include: { profile: true } }, team: { include: { members: true } } },
    });
  }

  // Admin can re-submit this endpoint (e.g. to fix a typo in kills/points)
  // without any risk of a winner getting paid twice — once a row's
  // `processed` flag is true, its prize is never touched again, no matter
  // how many times this runs.
  async submitResults(tournamentId: string, adminId: string, entries: ResultEntryDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) throw new NotFoundException('Tournament not found');

      const saved = [];

      for (const entry of entries) {
        const existing = await tx.tournamentResult.findUnique({
          where: { tournamentId_userId: { tournamentId, userId: entry.userId } },
        });

        if (existing?.processed) {
          saved.push(existing);
          continue;
        }

        const result = await tx.tournamentResult.upsert({
          where: { tournamentId_userId: { tournamentId, userId: entry.userId } },
          update: {
            teamId: entry.teamId,
            rank: entry.rank,
            kills: entry.kills ?? 0,
            points: entry.points ?? 0,
            prizeCoins: entry.prizeCoins,
            notes: entry.notes,
          },
          create: {
            tournamentId,
            userId: entry.userId,
            teamId: entry.teamId,
            rank: entry.rank,
            kills: entry.kills ?? 0,
            points: entry.points ?? 0,
            prizeCoins: entry.prizeCoins,
            notes: entry.notes,
          },
        });

        if (result.prizeCoins > 0) {
          await this.walletService.credit(
            {
              userId: result.userId,
              type: 'PRIZE_CREDIT',
              amount: result.prizeCoins,
              idempotencyKey: `prize:${tournamentId}:${result.userId}`,
              reference: tournamentId,
              description: `Prize — ${tournament.name}`,
              createdByAdminId: adminId,
            },
            tx,
          );
        }

        const finalResult = await tx.tournamentResult.update({
          where: { id: result.id },
          data: { processed: true },
        });

        await this.notifications.create(
          entry.userId,
          result.prizeCoins > 0 ? 'PRIZE_CREDITED' : 'RESULT_PUBLISHED',
          result.prizeCoins > 0 ? 'Prize credited' : 'Result published',
          result.prizeCoins > 0
            ? `You won ${result.prizeCoins} coins in ${tournament.name}!`
            : `Results for ${tournament.name} are out.`,
          tx,
        );

        saved.push(finalResult);
      }

      await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'COMPLETED' } });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'RESULTS_PUBLISHED',
          targetType: 'Tournament',
          targetId: tournamentId,
          reason: `Published ${saved.length} result row(s)`,
        },
      });

      return saved;
    });
  }
}
