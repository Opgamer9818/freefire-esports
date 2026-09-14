import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WalletService', () => {
  let service: WalletService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      walletTransaction: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      wallet: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('credit', () => {
    it('increases available balance and records a ledger entry', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 100, reservedBalance: 0 }]);
      mockPrisma.walletTransaction.create.mockResolvedValue({ id: 'txn1', amount: 50, balanceAfter: 150 });

      const result = await service.credit({
        userId: 'user1',
        type: 'COIN_PURCHASE',
        amount: 50,
        idempotencyKey: 'key1',
      });

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { availableBalance: 150, reservedBalance: 0 },
      });
      expect(result).toEqual({ id: 'txn1', amount: 50, balanceAfter: 150 });
    });

    it('is idempotent — the same key twice never double-credits', async () => {
      const existing = { id: 'txn1', amount: 50, balanceAfter: 150 };
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(existing);

      const result = await service.credit({
        userId: 'user1',
        type: 'COIN_PURCHASE',
        amount: 50,
        idempotencyKey: 'key1',
      });

      expect(result).toEqual(existing);
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('debit', () => {
    it('decreases available balance', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 100, reservedBalance: 0 }]);
      mockPrisma.walletTransaction.create.mockResolvedValue({ id: 'txn2', amount: -30, balanceAfter: 70 });

      await service.debit({
        userId: 'user1',
        type: 'TOURNAMENT_ENTRY',
        amount: 30,
        idempotencyKey: 'key2',
      });

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { availableBalance: 70, reservedBalance: 0 },
      });
    });

    it('rejects a debit larger than the available balance, and never writes anything', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 10, reservedBalance: 0 }]);

      await expect(
        service.debit({
          userId: 'user1',
          type: 'TOURNAMENT_ENTRY',
          amount: 30,
          idempotencyKey: 'key3',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('withdrawal reserve / finalize / reverse', () => {
    it('reserve moves coins from available into reserved, not out of the system', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 200, reservedBalance: 0 }]);
      mockPrisma.walletTransaction.create.mockResolvedValue({ id: 'txn4' });

      await service.reserve({
        userId: 'user1',
        type: 'WITHDRAWAL_RESERVE',
        amount: 50,
        idempotencyKey: 'key4',
      });

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { availableBalance: 150, reservedBalance: 50 },
      });
    });

    it('finalizeReservedDebit only reduces reserved — available was already debited at reserve time', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 150, reservedBalance: 50 }]);
      mockPrisma.walletTransaction.create.mockResolvedValue({ id: 'txn5' });

      await service.finalizeReservedDebit({
        userId: 'user1',
        type: 'WITHDRAWAL_DEBIT',
        amount: 50,
        idempotencyKey: 'key5',
      });

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { availableBalance: 150, reservedBalance: 0 },
      });
    });

    it('reverseReserved returns coins from reserved back to available (a rejected withdrawal)', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ availableBalance: 150, reservedBalance: 50 }]);
      mockPrisma.walletTransaction.create.mockResolvedValue({ id: 'txn6' });

      await service.reverseReserved({
        userId: 'user1',
        type: 'WITHDRAWAL_REVERSAL',
        amount: 50,
        idempotencyKey: 'key6',
      });

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: { availableBalance: 200, reservedBalance: 0 },
      });
    });
  });

  describe('error handling', () => {
    it('throws if the wallet row does not exist at all', async () => {
      mockPrisma.walletTransaction.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(
        service.credit({ userId: 'ghost', type: 'COIN_PURCHASE', amount: 10, idempotencyKey: 'key7' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
