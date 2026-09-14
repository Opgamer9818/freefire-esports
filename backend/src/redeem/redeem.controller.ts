import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RedeemService } from './redeem.service';
import { SubmitCodeDto } from './dto/submit-code.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('wallet/redeem-requests')
export class RedeemController {
  constructor(private readonly service: RedeemService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  submit(@CurrentUser() user: User, @Body() dto: SubmitCodeDto) {
    return this.service.submitCode(user.id, dto.code);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.service.myRequests(user.id);
  }
}
