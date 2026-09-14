import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means every other module can inject PrismaService without
// importing PrismaModule directly.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
