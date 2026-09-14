import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Tournament, TournamentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TournamentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly notifications: NotificationService,
  ) {}

  async listTournaments(filter: { status?: TournamentStatus; isFree?: boolean }) {
    return this.prisma.tournament.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.isFree !== undefined ? { isFree: filter.isFree } : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  async getTournament(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async myRegistrations(userId: string) {
    return this.prisma.tournamentRegistration.findMany({
      where: { userId },
      include: { tournament: true },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async getResults(tournamentId: string) {
    return this.prisma.tournamentResult.findMany({
      where: { tournamentId },
      include: { user: { include: { profile: true } } },
      orderBy: { rank: 'asc' },
    });
  }

  // ---------------- SOLO ----------------

  async registerSolo(tournamentId: string, userId: string) {
    const tournament = await this.getTournament(tournamentId);
    if (tournament.format !== 'SOLO') {
      throw new BadRequestException('This tournament needs a team — create or join one first');
    }
    return this.finalizeRegistration(tournament, userId, null);
  }

  // ---------------- TEAMS (DUO / SQUAD / CUSTOM) ----------------

  async createTeam(tournamentId: string, userId: string, name: string) {
    const tournament = await this.getTournament(tournamentId);
    if (tournament.format === 'SOLO') {
      throw new BadRequestException('Solo tournaments do not use teams');
    }

    return this.prisma.team.create({
      data: {
        tournamentId,
        name,
        captainId: userId,
        members: {
          create: { userId, ffUid: '', ffIgn: '', isCaptain: true },
        },
      },
      include: { members: true },
    });
  }

  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, tournament: true },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async joinTeam(teamId: string, userId: string, ffUid: string, ffIgn: string, contact?: string) {
    const team = await this.getTeam(teamId);

    if (team.members.some((m) => m.userId === userId)) {
      throw new BadRequestException('You are already on this team');
    }
    if (team.members.length >= team.tournament.teamSize) {
      throw new BadRequestException('This team is already full');
    }

    return this.prisma.teamMember.create({
      data: { teamId, userId, ffUid, ffIgn, contact },
    });
  }

  async updateMyTeamInfo(teamId: string, userId: string, ffUid: string, ffIgn: string, contact?: string) {
    const member = await this.prisma.teamMember.findFirst({ where: { teamId, userId } });
    if (!member) throw new ForbiddenException('You are not a member of this team');

    return this.prisma.teamMember.update({
      where: { id: member.id },
      data: { ffUid, ffIgn, contact },
    });
  }

  // Captain calls this once the roster is full — this is where the
  // actual TournamentRegistration + entry-fee deduction happens.
  async finalizeTeamRegistration(tournamentId: string, teamId: string, userId: string) {
    const team = await this.getTeam(teamId);
    if (team.captainId !== userId) {
      throw new ForbiddenException('Only the team captain can finalize registration');
    }

    const tournament = await this.getTournament(tournamentId);
    if (team.members.length !== tournament.teamSize) {
      throw new BadRequestException(
        `Team needs exactly ${tournament.teamSize} members (currently has ${team.members.length})`,
      );
    }
    if (team.members.some((m) => !m.ffUid || !m.ffIgn)) {
      throw new BadRequestException('Every team member needs a Free Fire UID and IGN filled in first');
    }

    return this.finalizeRegistration(tournament, userId, teamId);
  }

  // ---------------- Shared registration path ----------------
  // Every check, the entry-fee deduction, and the registration insert
  // happen in exactly one place so there's only one code path that can
  // ever create a TournamentRegistration row.
  private async finalizeRegistration(tournament: Tournament, userId: string, teamId: string | null) {
    if (tournament.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException('Registration is not open for this tournament');
    }

    const now = new Date();
    if (now < tournament.registrationOpenAt || now > tournament.registrationCloseAt) {
      throw new BadRequestException('The registration window for this tournament is closed');
    }

    if (tournament.slotsFilled >= tournament.slots) {
      throw new BadRequestException('This tournament is full');
    }

    const alreadyRegistered = await this.prisma.tournamentRegistration.findUnique({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId } },
    });
    if (alreadyRegistered) {
      throw new BadRequestException('You are already registered for this tournament');
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-check the slot count inside the transaction to close the race
      // window between the check above and this write.
      const fresh = await tx.tournament.findUniqueOrThrow({ where: { id: tournament.id } });
      if (fresh.slotsFilled >= fresh.slots) {
        throw new BadRequestException('This tournament is full');
      }

      if (!tournament.isFree && tournament.entryFeeCoins > 0) {
        await this.walletService.debit(
          {
            userId,
            type: 'TOURNAMENT_ENTRY',
            amount: tournament.entryFeeCoins,
            idempotencyKey: `entry:${tournament.id}:${userId}`,
            reference: tournament.id,
            description: `Entry fee — ${tournament.name}`,
          },
          tx,
        );
      }

      await tx.tournament.update({
        where: { id: tournament.id },
        data: { slotsFilled: { increment: 1 } },
      });

      return tx.tournamentRegistration.create({
        data: {
          tournamentId: tournament.id,
          userId,
          teamId,
          entryFeePaid: tournament.isFree ? 0 : tournament.entryFeeCoins,
          status: 'CONFIRMED',
        },
      });
    }).then(async (registration) => {
      await this.notifications.create(
        userId,
        'REGISTRATION_SUCCESS',
        'Registration confirmed',
        `You're in for ${tournament.name}. Good luck!`,
      );
      return registration;
    });
  }
}
