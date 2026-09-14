import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from '../admin/admin-jwt.guard';
import { CurrentAdmin } from '../admin/current-admin.decorator';
import { PaymentRequestService } from './payment-request.service';
import { ResolveRequestDto } from './dto/resolve-request.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/payment-requests')
export class AdminPaymentRequestController {
  constructor(private readonly service: PaymentRequestService) {}

  @Get()
  listPending() {
    return this.service.listPending();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.approve(id, admin.id, dto.note);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentAdmin() admin: AdminUser, @Body() dto: ResolveRequestDto) {
    return this.service.reject(id, admin.id, dto.note);
  }
}
