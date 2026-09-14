import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminUserService } from './admin-user.service';
import { BanUserDto } from './dto/ban-user.dto';

@UseGuards(AdminJwtGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.service.list(search);
  }

  @Post(':id/ban')
  ban(@Param('id') id: string, @Body() dto: BanUserDto, @CurrentAdmin() admin: AdminUser) {
    return this.service.ban(id, admin.id, dto.reason);
  }

  @Post(':id/unban')
  unban(@Param('id') id: string, @CurrentAdmin() admin: AdminUser) {
    return this.service.unban(id, admin.id);
  }
}
