import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '@prisma/client';

// Only valid on routes protected by AdminJwtGuard.
export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): AdminUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.admin;
});
