import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminModule } from '../admin/admin.module';
import { PaymentRequestController } from './payment-request.controller';
import { AdminPaymentRequestController } from './admin-payment-request.controller';
import { PaymentRequestService } from './payment-request.service';

@Module({
  imports: [AuthModule, WalletModule, AdminModule],
  controllers: [PaymentRequestController, AdminPaymentRequestController],
  providers: [PaymentRequestService],
})
export class PaymentModule {}
