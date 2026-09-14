import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminTournamentService } from './admin-tournament.service';
import { TournamentFormDto } from './dto/tournament-form.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/tournaments')
export class AdminTournamentController {
  constructor(private readonly service: AdminTournamentService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() dto: TournamentFormDto, @CurrentAdmin() admin: AdminUser) {
    return this.service.create(dto, admin.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: TournamentFormDto, @CurrentAdmin() admin: AdminUser) {
    return this.service.update(id, dto, admin.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentAdmin() admin: AdminUser) {
    return this.service.cancel(id, admin.id);
  }
}
