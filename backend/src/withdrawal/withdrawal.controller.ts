import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WithdrawalService } from './withdrawal.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly service: WithdrawalService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  request(@CurrentUser() user: User, @Body() dto: RequestWithdrawalDto) {
    return this.service.requestWithdrawal(user.id, dto.amount, dto.upiId, dto.upiQrUrl);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.service.myRequests(user.id);
  }
}
