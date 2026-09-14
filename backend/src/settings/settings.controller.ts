import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { SettingsService } from './settings.service';

@UseGuards(FirebaseAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('payment-info')
  async paymentInfo() {
    return {
      upiId: await this.settings.get<string>('upi_id'),
      upiPayeeName: await this.settings.get<string>('upi_payee_name'),
      coinRateInr: await this.settings.get<number>('coin_rate_inr'),
    };
  }
}
