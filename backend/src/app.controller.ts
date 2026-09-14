import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /health — used to confirm Phase 1 is wired up correctly.
  // Not part of the real product API surface.
  @Get('health')
  async health() {
    return this.appService.checkHealth();
  }
}
