import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TournamentStatus, User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TournamentService } from './tournament.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get()
  list(@Query('status') status?: TournamentStatus, @Query('isFree') isFree?: string) {
    return this.tournamentService.listTournaments({
      status,
      isFree: isFree === undefined ? undefined : isFree === 'true',
    });
  }

  // Declared before ':id' so it isn't swallowed by the param route.
  @Get('mine')
  myRegistrations(@CurrentUser() user: User) {
    return this.tournamentService.myRegistrations(user.id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tournamentService.getTournament(id);
  }

  @Get(':id/results')
  results(@Param('id') id: string) {
    return this.tournamentService.getResults(id);
  }

  @Post(':id/register')
  registerSolo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tournamentService.registerSolo(id, user.id);
  }

  @Post(':id/teams')
  createTeam(@Param('id') id: string, @Body() dto: CreateTeamDto, @CurrentUser() user: User) {
    return this.tournamentService.createTeam(id, user.id, dto.name);
  }

  @Get('teams/:teamId')
  getTeam(@Param('teamId') teamId: string) {
    return this.tournamentService.getTeam(teamId);
  }

  @Post('teams/:teamId/join')
  joinTeam(@Param('teamId') teamId: string, @Body() dto: JoinTeamDto, @CurrentUser() user: User) {
    return this.tournamentService.joinTeam(teamId, user.id, dto.ffUid, dto.ffIgn, dto.contact);
  }

  @Put('teams/:teamId/me')
  updateMyTeamInfo(@Param('teamId') teamId: string, @Body() dto: JoinTeamDto, @CurrentUser() user: User) {
    return this.tournamentService.updateMyTeamInfo(teamId, user.id, dto.ffUid, dto.ffIgn, dto.contact);
  }

  @Post(':id/teams/:teamId/finalize')
  finalize(@Param('id') id: string, @Param('teamId') teamId: string, @CurrentUser() user: User) {
    return this.tournamentService.finalizeTeamRegistration(id, teamId, user.id);
  }
}
