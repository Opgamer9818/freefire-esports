import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

// Usage: getMyProfile(@CurrentUser() user: User) { ... }
// Only valid on routes protected by FirebaseAuthGuard, which is what
// actually puts `user` on the request in the first place.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
