import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTicketDto) {
    return this.service.createTicket(user.id, dto.category, dto.message);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.service.myTickets(user.id);
  }
}
