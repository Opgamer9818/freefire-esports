import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    // A trivial query that only succeeds if the DB connection AND the
    // migrated schema are both working correctly.
    const userCount = await this.prisma.user.count();
    return {
      status: 'ok',
      database: 'connected',
      users: userCount,
      timestamp: new Date().toISOString(),
    };
  }
}
