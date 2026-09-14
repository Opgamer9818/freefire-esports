import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtGuard } from './admin-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

function mockContext(headers: Record<string, string>): ExecutionContext {
  const request: any = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('AdminJwtGuard', () => {
  let guard: AdminJwtGuard;
  let jwtService: JwtService;
  let mockPrisma: any;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret-for-specs-only' });
    mockPrisma = { adminUser: { findUnique: jest.fn() } };
    guard = new AdminJwtGuard(jwtService, mockPrisma as unknown as PrismaService);
  });

  it('rejects a request with no token', async () => {
    await expect(guard.canActivate(mockContext({}))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token signed with a different secret', async () => {
    const otherJwt = new JwtService({ secret: 'a-completely-different-secret' });
    const badToken = otherJwt.sign({ sub: 'admin-1' });

    await expect(
      guard.canActivate(mockContext({ authorization: `Bearer ${badToken}` })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a structurally valid token for an admin that does not exist in the DB', async () => {
    const token = jwtService.sign({ sub: 'deleted-admin' });
    mockPrisma.adminUser.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(mockContext({ authorization: `Bearer ${token}` })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('accepts a valid token for an existing admin and attaches it to the request', async () => {
    const token = jwtService.sign({ sub: 'admin-1' });
    mockPrisma.adminUser.findUnique.mockResolvedValue({ id: 'admin-1', username: 'owner' });

    const context = mockContext({ authorization: `Bearer ${token}` });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect((context.switchToHttp().getRequest() as any).admin.username).toBe('owner');
  });

  it('has zero overlap with player auth — a plausible-looking forged token still needs a real AdminUser row', async () => {
    const forgedToken = jwtService.sign({ sub: 'some-random-user-id' });
    mockPrisma.adminUser.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(mockContext({ authorization: `Bearer ${forgedToken}` })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
