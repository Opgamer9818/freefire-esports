import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from '../admin/admin-jwt.guard';
import { CurrentAdmin } from '../admin/current-admin.decorator';
import { RedeemService } from './redeem.service';
import { ApproveRedeemDto } from './dto/approve-redeem.dto';
import { ResolveRequestDto } from '../payment/dto/resolve-request.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/redeem-requests')
export class AdminRedeemController {
  constructor(private readonly service: RedeemService) {}

  @Get()
  listPending() {
    return this.service.listPending();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ApproveRedeemDto) {
    return this.service.approve(id, admin.id, dto.approvedCoins, dto.note);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.reject(id, admin.id, dto.note);
  }
}
