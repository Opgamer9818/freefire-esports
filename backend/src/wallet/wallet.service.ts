import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, WalletTxnType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface LedgerInput {
  userId: string;
  type: WalletTxnType;
  amount: number; // always positive — each public method below applies the right sign/target
  idempotencyKey: string;
  reference?: string;
  description?: string;
  createdByAdminId?: string;
}

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // The ONLY methods in the whole codebase allowed to change a wallet
  // balance. Every credit, debit, and withdrawal reserve/payout/reversal
  // funnels through `write` below. Pass `tx` when this needs to happen
  // atomically alongside other writes (e.g. tournament registration,
  // withdrawal request creation).

  async credit(input: LedgerInput, tx?: Prisma.TransactionClient) {
    return this.write(
      { ...input, availableDelta: Math.abs(input.amount), reservedDelta: 0 },
      tx,
    );
  }

  async debit(input: LedgerInput, tx?: Prisma.TransactionClient) {
    return this.write(
      { ...input, availableDelta: -Math.abs(input.amount), reservedDelta: 0 },
      tx,
    );
  }

  // Withdrawal requested: moves coins from available into reserved so
  // they can't be spent twice while the request is pending.
  async reserve(input: LedgerInput, tx?: Prisma.TransactionClient) {
    return this.write(
      { ...input, availableDelta: -Math.abs(input.amount), reservedDelta: Math.abs(input.amount) },
      tx,
    );
  }

  // Withdrawal marked Paid: the reserved amount leaves the system for
  // good. Only ever call this after funds were already reserved for the
  // same request.
  async finalizeReservedDebit(input: LedgerInput, tx?: Prisma.TransactionClient) {
    return this.write(
      { ...input, availableDelta: 0, reservedDelta: -Math.abs(input.amount) },
      tx,
    );
  }

  // Withdrawal rejected/cancelled: reserved coins go back to available.
  async reverseReserved(input: LedgerInput, tx?: Prisma.TransactionClient) {
    return this.write(
      { ...input, availableDelta: Math.abs(input.amount), reservedDelta: -Math.abs(input.amount) },
      tx,
    );
  }

  private async write(
    input: LedgerInput & { availableDelta: number; reservedDelta: number },
    tx?: Prisma.TransactionClient,
  ) {
    const run = async (db: Prisma.TransactionClient) => {
      // Idempotency: if this exact operation already happened, return the
      // existing record instead of processing it again.
      const existing = await db.walletTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;

      // Row lock so two concurrent calls for the same user can't both
      // read the same stale balances and both "succeed".
      const locked = await db.$queryRaw<{ availableBalance: number; reservedBalance: number }[]>`
        SELECT "availableBalance", "reservedBalance" FROM "Wallet" WHERE "userId" = ${input.userId} FOR UPDATE
      `;
      if (!locked[0]) throw new BadRequestException('Wallet not found for user');

      const newAvailable = locked[0].availableBalance + input.availableDelta;
      const newReserved = locked[0].reservedBalance + input.reservedDelta;

      if (newAvailable < 0) throw new BadRequestException('Insufficient available balance');
      if (newReserved < 0) throw new BadRequestException('Insufficient reserved balance');

      await db.wallet.update({
        where: { userId: input.userId },
        data: { availableBalance: newAvailable, reservedBalance: newReserved },
      });

      const movementAmount = input.availableDelta !== 0 ? input.availableDelta : input.reservedDelta;

      try {
        return await db.walletTransaction.create({
          data: {
            userId: input.userId,
            type: input.type,
            amount: movementAmount,
            balanceAfter: newAvailable,
            idempotencyKey: input.idempotencyKey,
            reference: input.reference,
            description: input.description,
            createdByAdminId: input.createdByAdminId,
          },
        });
      } catch (e) {
        // Lost a race with a concurrent identical request — treat as
        // already-done rather than crash.
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return db.walletTransaction.findUniqueOrThrow({ where: { idempotencyKey: input.idempotencyKey } });
        }
        throw e;
      }
    };

    if (tx) return run(tx);
    return this.prisma.$transaction((client) => run(client));
  }

  async getBalance(userId: string) {
    return this.prisma.wallet.findUniqueOrThrow({ where: { userId } });
  }

  async getTransactions(userId: string, limit = 50) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
