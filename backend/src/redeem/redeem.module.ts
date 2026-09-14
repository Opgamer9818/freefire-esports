import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminModule } from '../admin/admin.module';
import { RedeemController } from './redeem.controller';
import { AdminRedeemController } from './admin-redeem.controller';
import { RedeemService } from './redeem.service';

@Module({
  imports: [AuthModule, WalletModule, AdminModule],
  controllers: [RedeemController, AdminRedeemController],
  providers: [RedeemService],
})
export class RedeemModule {}
