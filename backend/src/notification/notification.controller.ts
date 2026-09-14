import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationService } from './notification.service';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.service.listForUser(user.id);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.markRead(user.id, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.service.markAllRead(user.id);
  }

  @Put('fcm-token')
  registerToken(@CurrentUser() user: User, @Body() dto: RegisterFcmTokenDto) {
    return this.service.registerFcmToken(user.id, dto.token);
  }
}
