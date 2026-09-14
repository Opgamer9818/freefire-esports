import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

function mockContext(headers: Record<string, string>): ExecutionContext {
  const request: any = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockPrisma: any;
  let mockVerifyIdToken: jest.Mock;

  beforeEach(() => {
    mockVerifyIdToken = jest.fn();
    (admin.auth as unknown as jest.Mock).mockReturnValue({ verifyIdToken: mockVerifyIdToken });

    mockPrisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      profile: { create: jest.fn() },
      wallet: { create: jest.fn() },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    guard = new FirebaseAuthGuard(mockPrisma as unknown as PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('rejects a request with no Authorization header', async () => {
    const context = mockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a header that is not a Bearer token', async () => {
    const context = mockContext({ authorization: 'Basic dXNlcjpwYXNz' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token that fails Firebase verification', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('invalid'));
    const context = mockContext({ authorization: 'Bearer bad-token' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('provisions User + Profile + Wallet together the first time a Firebase identity is seen', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'fb-uid-1', email: 'test@example.com' });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', firebaseUid: 'fb-uid-1', isBanned: false });

    const context = mockContext({ authorization: 'Bearer good-token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPrisma.profile.create).toHaveBeenCalledWith({ data: { userId: 'user-1' } });
    expect(mockPrisma.wallet.create).toHaveBeenCalledWith({ data: { userId: 'user-1' } });
    expect((context.switchToHttp().getRequest() as any).user.id).toBe('user-1');
  });

  it('does not re-provision an existing user on a later login', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'fb-uid-1' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', isBanned: false });

    await guard.canActivate(mockContext({ authorization: 'Bearer good-token' }));

    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(mockPrisma.profile.create).not.toHaveBeenCalled();
    expect(mockPrisma.wallet.create).not.toHaveBeenCalled();
  });

  it('rejects a banned user even with an otherwise valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'fb-uid-2' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', isBanned: true });

    const context = mockContext({ authorization: 'Bearer good-token' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
