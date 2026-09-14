import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';

describe('TournamentService — registration safety', () => {
  let service: TournamentService;
  let mockPrisma: any;
  let mockWallet: any;

  const openTournament = {
    id: 't1',
    status: 'REGISTRATION_OPEN',
    slots: 10,
    slotsFilled: 0,
    entryFeeCoins: 20,
    isFree: false,
    registrationOpenAt: new Date(Date.now() - 1000 * 60),
    registrationCloseAt: new Date(Date.now() + 1000 * 60 * 60),
    format: 'SOLO',
    name: 'Test Cup',
  };

  beforeEach(async () => {
    mockPrisma = {
      tournament: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn(), update: jest.fn() },
      tournamentRegistration: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };
    mockWallet = { debit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WalletService, useValue: mockWallet },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('rejects registering twice for the same tournament', async () => {
    mockPrisma.tournament.findUnique.mockResolvedValue(openTournament);
    mockPrisma.tournamentRegistration.findUnique.mockResolvedValue({ id: 'existing-reg' });

    await expect(service.registerSolo('t1', 'user1')).rejects.toThrow(BadRequestException);
    expect(mockWallet.debit).not.toHaveBeenCalled();
  });

  it('rejects registration once the tournament is full', async () => {
    mockPrisma.tournament.findUnique.mockResolvedValue({ ...openTournament, slotsFilled: 10 });
    mockPrisma.tournamentRegistration.findUnique.mockResolvedValue(null);

    await expect(service.registerSolo('t1', 'user1')).rejects.toThrow(BadRequestException);
    expect(mockWallet.debit).not.toHaveBeenCalled();
  });

  it('rejects registration outside the registration window', async () => {
    const closed = { ...openTournament, registrationCloseAt: new Date(Date.now() - 1000) };
    mockPrisma.tournament.findUnique.mockResolvedValue(closed);
    mockPrisma.tournamentRegistration.findUnique.mockResolvedValue(null);

    await expect(service.registerSolo('t1', 'user1')).rejects.toThrow(BadRequestException);
  });

  it('deducts exactly the server-known entry fee — there is no path for a client to supply its own amount', async () => {
    mockPrisma.tournament.findUnique.mockResolvedValue(openTournament);
    mockPrisma.tournamentRegistration.findUnique.mockResolvedValue(null);
    mockPrisma.tournament.findUniqueOrThrow.mockResolvedValue(openTournament);
    mockPrisma.tournamentRegistration.create.mockResolvedValue({ id: 'reg1' });

    await service.registerSolo('t1', 'user1');

    expect(mockWallet.debit).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user1', amount: 20, type: 'TOURNAMENT_ENTRY' }),
      mockPrisma,
    );
  });

  it('never touches the wallet for a free tournament', async () => {
    const free = { ...openTournament, isFree: true, entryFeeCoins: 0 };
    mockPrisma.tournament.findUnique.mockResolvedValue(free);
    mockPrisma.tournamentRegistration.findUnique.mockResolvedValue(null);
    mockPrisma.tournament.findUniqueOrThrow.mockResolvedValue(free);
    mockPrisma.tournamentRegistration.create.mockResolvedValue({ id: 'reg2' });

    await service.registerSolo('t1', 'user1');

    expect(mockWallet.debit).not.toHaveBeenCalled();
  });

  it('rejects a solo registration attempt on a team-format tournament', async () => {
    mockPrisma.tournament.findUnique.mockResolvedValue({ ...openTournament, format: 'SQUAD' });

    await expect(service.registerSolo('t1', 'user1')).rejects.toThrow(BadRequestException);
    expect(mockWallet.debit).not.toHaveBeenCalled();
  });
});
