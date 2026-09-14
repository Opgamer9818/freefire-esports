import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../admin/admin-jwt.guard';
import { SupportService } from './support.service';
import { RespondTicketDto } from './dto/respond-ticket.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/support/tickets')
export class AdminSupportController {
  constructor(private readonly service: SupportService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.service.listAll(status);
  }

  @Post(':id/respond')
  respond(@Param('id') id: string, @Body() dto: RespondTicketDto) {
    return this.service.respond(id, dto.adminResponse, dto.status);
  }
}
