import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Every other service in the app talks to the database through this one
// injectable service — never through a fresh PrismaClient of its own.
// That's what makes it possible to guarantee wallet writes only ever
// happen inside a real transaction (see WalletService, added Phase 4).
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
