import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AdminJwtGuard)
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { admin: { select: { username: true } } },
    });
  }
}
