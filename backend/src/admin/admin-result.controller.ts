import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminResultService } from './admin-result.service';
import { SubmitResultsDto } from './dto/submit-results.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/tournaments/:id')
export class AdminResultController {
  constructor(private readonly service: AdminResultService) {}

  @Get('registrations')
  registrations(@Param('id') tournamentId: string) {
    return this.service.getRegistrations(tournamentId);
  }

  @Get('results')
  results(@Param('id') tournamentId: string) {
    return this.service.getResults(tournamentId);
  }

  @Post('results')
  submit(@Param('id') tournamentId: string, @Body() dto: SubmitResultsDto, @CurrentAdmin() admin: AdminUser) {
    return this.service.submitResults(tournamentId, admin.id, dto.results);
  }
}
