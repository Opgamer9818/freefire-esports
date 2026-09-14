import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { AdminJwtGuard } from './admin-jwt.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const MANAGED_KEYS = ['upi_id', 'upi_payee_name', 'coin_rate_inr', 'min_withdrawal', 'max_withdrawal'] as const;

@UseGuards(AdminJwtGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAll() {
    const values = await Promise.all(MANAGED_KEYS.map((k) => this.settings.get(k)));
    return Object.fromEntries(MANAGED_KEYS.map((k, i) => [k, values[i]]));
  }

  @Put()
  async update(@Body() dto: UpdateSettingsDto, @CurrentAdmin() admin: AdminUser) {
    const before = await this.getAll();
    const changed: string[] = [];

    for (const key of MANAGED_KEYS) {
      const value = dto[key];
      if (value !== undefined) {
        await this.settings.set(key, value, admin.id);
        changed.push(key);
      }
    }

    const after = await this.getAll();

    if (changed.length > 0) {
      await this.prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: 'SETTINGS_UPDATED',
          targetType: 'AppSetting',
          targetId: changed.join(','),
          beforeJson: before,
          afterJson: after,
        },
      });
    }

    return after;
  }
}
