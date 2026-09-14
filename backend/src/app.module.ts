import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { WalletModule } from './wallet/wallet.module';
import { TournamentModule } from './tournament/tournament.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentModule } from './payment/payment.module';
import { RedeemModule } from './redeem/redeem.module';
import { AdminModule } from './admin/admin.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { NotificationModule } from './notification/notification.module';
import { SupportModule } from './support/support.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    ProfileModule,
    SettingsModule,
    NotificationModule,
    WalletModule,
    TournamentModule,
    PaymentModule,
    RedeemModule,
    AdminModule,
    WithdrawalModule,
    SupportModule,

    // Phase 12+13: no new modules — testing and release packaging only.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Applies the throttler configured above to every route by default.
    // Individual controllers use @Throttle(...) to set a stricter limit
    // (admin login, payment/redeem/withdrawal creation) — see Phase 11
    // setup notes.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
