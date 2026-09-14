import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';

@UseGuards(FirebaseAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getBalance(@CurrentUser() user: User) {
    return this.walletService.getBalance(user.id);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: User) {
    return this.walletService.getTransactions(user.id);
  }
}
