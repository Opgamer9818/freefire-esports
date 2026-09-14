import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from '../admin/admin-jwt.guard';
import { CurrentAdmin } from '../admin/current-admin.decorator';
import { WithdrawalService } from './withdrawal.service';
import { ResolveRequestDto } from '../payment/dto/resolve-request.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/withdrawals')
export class AdminWithdrawalController {
  constructor(private readonly service: WithdrawalService) {}

  @Get()
  list() {
    return this.service.listActive();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.approve(id, admin.id, dto.note);
  }

  @Post(':id/processing')
  processing(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.markProcessing(id, admin.id, dto.note);
  }

  @Post(':id/paid')
  paid(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.markPaid(id, admin.id, dto.note);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.reject(id, admin.id, dto.note);
  }
}
