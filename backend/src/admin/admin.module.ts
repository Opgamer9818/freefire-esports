import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WalletModule } from '../wallet/wallet.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtGuard } from './admin-jwt.guard';
import { AdminTournamentController } from './admin-tournament.controller';
import { AdminTournamentService } from './admin-tournament.service';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminAuditController } from './admin-audit.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminResultController } from './admin-result.controller';
import { AdminResultService } from './admin-result.service';

@Module({
  imports: [
    WalletModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.ADMIN_JWT_SECRET,
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminTournamentController,
    AdminUserController,
    AdminDashboardController,
    AdminAuditController,
    AdminSettingsController,
    AdminResultController,
  ],
  providers: [AdminAuthService, AdminJwtGuard, AdminTournamentService, AdminUserService, AdminResultService],
  exports: [AdminJwtGuard, JwtModule],
})
export class AdminModule {}
