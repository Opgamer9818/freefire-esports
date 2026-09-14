import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Defaults used until an admin overrides them (via Prisma Studio for now,
// via the Admin Settings screen from Phase 7 onward). Nothing here is
// hard-coded into the actual payment/coin logic — it's all read through
// this service, so changing a value here (or in the DB) takes effect
// immediately with no redeploy.
const DEFAULTS: Record<string, unknown> = {
  upi_id: 'vanshverma3918@fam',
  upi_payee_name: 'Free Fire Esports',
  coin_rate_inr: 1, // 1 coin = this many INR
  min_withdrawal: 100,
  max_withdrawal: 50000,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get<T = unknown>(key: string): Promise<T> {
    const row = await this.prisma.appSetting.findUnique({ where: { key } });
    if (row) return row.value as T;
    return DEFAULTS[key] as T;
  }

  async set(key: string, value: unknown, adminId?: string) {
    return this.prisma.appSetting.upsert({
      where: { key },
      update: { value: value as any, updatedByAdminId: adminId },
      create: { key, value: value as any, updatedByAdminId: adminId },
    });
  }
}
