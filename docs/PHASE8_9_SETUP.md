# Phase 8 + 9 Setup — Results/Prizes + Withdrawals

No new migration — everything used already existed in the schema.

## 1. Restart the backend

```
cd backend
npm run start:dev
```

Both admin and Android pick up the new endpoints automatically.

## 2. Test Results + Prizes (Phase 8)

1. In the admin panel, open a tournament that has at least one registered
   player (from Phase 3+4 testing) → click **Results**
2. Enter a rank and a prize amount for one or more players → **Publish
   Results**
3. Confirm the prize landed: check that player's Wallet in the Android
   app, or the Audit Logs page (`PRIZE_CREDIT` transaction, `RESULTS_PUBLISHED`
   audit entry)
4. **Try publishing again** with the same or different numbers for a
   player who's already marked "Paid out" — their prize should NOT change
   or double-credit. The row is locked once it's processed.
5. The tournament's status flips to `COMPLETED` automatically.

## 3. Test Withdrawals (Phase 9)

1. Make sure a test player has some coins (from Phase 5/6/8 testing)
2. In the Android app: **Wallet → Withdraw** → enter an amount and a UPI
   ID → **Request Withdrawal**
3. Check the Android Wallet screen — the balance should have dropped by
   the withdrawal amount immediately (it's reserved, not just pending)
4. In the admin panel: **Withdrawals** → you'll see it as `PENDING` →
   **Approve** → **Mark Processing** (optional step) → **Mark Paid**
5. Confirm: the coins are now fully gone (check that player's wallet
   transactions — you'll see `WITHDRAWAL_RESERVE` then `WITHDRAWAL_DEBIT`)
6. Try the **Reject** path on a different request instead — confirm the
   reserved amount comes back to the player's available balance
   (`WITHDRAWAL_REVERSAL` transaction)

## What to check specifically (money correctness)

- A withdrawal amount is deducted from available balance the moment it's
  requested — not just when it's approved
- Rejecting a withdrawal at any stage before "Paid" returns the exact
  reserved amount, no more, no less
- Publishing the same tournament's results twice never credits a prize
  twice, even if you change the numbers on the second attempt for an
  already-paid row
- Minimum/maximum withdrawal amounts (Settings page) are enforced

## If something goes wrong

Paste me the exact error and I'll fix it.

## What's next

**Phase 10 — Notifications + support.**
