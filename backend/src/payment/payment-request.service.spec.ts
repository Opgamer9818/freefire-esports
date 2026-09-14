import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentRequestService } from './payment-request.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notification/notification.service';

describe('PaymentRequestService — approval safety', () => {
  let service: PaymentRequestService;
  let mockPrisma: any;
  let mockWallet: any;

  beforeEach(async () => {
    mockPrisma = {
      paymentRequest: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      adminAction: { create: jest.fn() },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };
    mockWallet = { credit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRequestService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WalletService, useValue: mockWallet },
        { provide: SettingsService, useValue: { get: jest.fn().mockResolvedValue(1) } },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentRequestService>(PaymentRequestService);
  });

  afterEach(() => jest.clearAllMocks());

  it('credits exactly the requested coin amount on approval', async () => {
    mockPrisma.paymentRequest.findUnique.mockResolvedValue({
      id: 'req1',
      userId: 'user1',
      requestedCoins: 100,
      status: 'PENDING',
    });
    mockPrisma.paymentRequest.update.mockResolvedValue({ id: 'req1', status: 'APPROVED' });

    await service.approve('req1', 'admin1');

    expect(mockWallet.credit).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user1', amount: 100, idempotencyKey: 'payreq-approve:req1' }),
      mockPrisma,
    );
  });

  it('refuses to approve a request that is already resolved — the core "cannot double-credit" guarantee', async () => {
    mockPrisma.paymentRequest.findUnique.mockResolvedValue({
      id: 'req1',
      userId: 'user1',
      requestedCoins: 100,
      status: 'APPROVED',
    });

    await expect(service.approve('req1', 'admin1')).rejects.toThrow(BadRequestException);
    expect(mockWallet.credit).not.toHaveBeenCalled();
  });

  it('refuses to reject a request that is already resolved', async () => {
    mockPrisma.paymentRequest.findUnique.mockResolvedValue({
      id: 'req1',
      userId: 'user1',
      requestedCoins: 100,
      status: 'REJECTED',
    });

    await expect(service.reject('req1', 'admin1')).rejects.toThrow(BadRequestException);
  });

  it('always derives the same idempotency key from the request id, so a retried/duplicated approve call is caught by WalletService too', async () => {
    mockPrisma.paymentRequest.findUnique.mockResolvedValue({
      id: 'req1',
      userId: 'user1',
      requestedCoins: 100,
      status: 'PENDING',
    });
    mockPrisma.paymentRequest.update.mockResolvedValue({ id: 'req1', status: 'APPROVED' });

    await service.approve('req1', 'admin1');

    expect(mockWallet.credit.mock.calls[0][0].idempotencyKey).toBe('payreq-approve:req1');
  });

  it('blocks a new request once a player already has 3 pending', async () => {
    mockPrisma.paymentRequest.count.mockResolvedValue(3);

    await expect(service.createRequest('user1', 50)).rejects.toThrow(BadRequestException);
    expect(mockPrisma.paymentRequest.create).not.toHaveBeenCalled();
  });
});
