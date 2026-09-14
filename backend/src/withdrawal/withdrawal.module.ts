import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminModule } from '../admin/admin.module';
import { WithdrawalController } from './withdrawal.controller';
import { AdminWithdrawalController } from './admin-withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';

@Module({
  imports: [AuthModule, WalletModule, AdminModule],
  controllers: [WithdrawalController, AdminWithdrawalController],
  providers: [WithdrawalService],
})
export class WithdrawalModule {}
