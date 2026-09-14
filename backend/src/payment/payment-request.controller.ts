import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaymentRequestService } from './payment-request.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { SubmitReferenceDto } from './dto/submit-reference.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('wallet/payment-requests')
export class PaymentRequestController {
  constructor(private readonly service: PaymentRequestService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePaymentRequestDto) {
    return this.service.createRequest(user.id, dto.requestedCoins);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.service.myRequests(user.id);
  }

  @Put(':id/reference')
  submitReference(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: SubmitReferenceDto) {
    return this.service.submitReference(user.id, id, dto.utrReference, dto.screenshotUrl);
  }
}
