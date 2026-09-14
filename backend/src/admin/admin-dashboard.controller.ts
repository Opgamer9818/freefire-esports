import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from './admin-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AdminJwtGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [totalUsers, pendingPayments, pendingRedeems, totalTournaments, totalRegistrations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.redeemRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.tournament.count(),
      this.prisma.tournamentRegistration.count(),
    ]);

    return { totalUsers, pendingPayments, pendingRedeems, totalTournaments, totalRegistrations };
  }
}
