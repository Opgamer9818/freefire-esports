# Phase 3 + 4 Setup — Tournaments + Wallet

No new Firebase setup, no new migration — Phase 1's schema already had
every table this phase uses.

## 1. Restart the backend

```
cd backend
npm run start:dev
```

## 2. Create a test tournament (no admin panel yet — that's Phase 7)

Open Prisma Studio, a GUI for your database:

```
cd backend
npx prisma studio
```

It opens in your browser. Click the **Tournament** table → **Add record**
and fill in at minimum:

| field | example value |
|---|---|
| name | Test Solo Cup |
| format | SOLO |
| teamSize | 1 |
| entryFeeCoins | 0 |
| isFree | true |
| prizePool | 100 |
| slots | 50 |
| date | (any future date) |
| startTime | (any future time) |
| registrationOpenAt | (a time in the past, so it's open now) |
| registrationCloseAt | (a time in the future) |
| status | REGISTRATION_OPEN |
| createdByAdminId | any placeholder string, e.g. `seed` |

Start with a **free SOLO tournament** — it needs no wallet balance, so
you can test registration immediately.

### To test a paid tournament

Since Add Coins (Phase 5) doesn't exist yet, give yourself a test balance
directly: in Prisma Studio, open the **Wallet** table, find your user's
row, and edit `availableBalance` to something like `500`. Then create a
second tournament with `isFree = false` and `entryFeeCoins` set to
whatever you want to test.

## 3. Test in the app

1. Sign in (from Phase 2) → you land on **Home**, showing your wallet
   balance and the tournament(s) you created
2. Tap your test tournament → **Join Tournament** (solo) or **Create /
   Join Team** (duo/squad)
3. For a paid tournament, confirm the balance actually decreases by the
   entry fee afterward (check the Home wallet chip, or open **Wallet** →
   see the `TOURNAMENT_ENTRY` transaction)
4. Try joining the same tournament twice — it should be blocked
5. For duo/squad: create a team, copy the **Team ID** shown, use a second
   test account (or Prisma Studio) to simulate a teammate joining with
   that ID, fill in everyone's Free Fire UID/IGN, then have the captain
   tap **Finalize Registration**

## What to check specifically (money correctness)

- Balance only ever changes by exactly the entry fee, once
- Registering twice for the same tournament is rejected
- `slotsFilled` increments by exactly 1 per successful registration
- If a debit fails (insufficient balance), no registration row is created

## If something goes wrong

Paste me the exact error from the backend terminal or the Android Logcat
and I'll fix it.

## What's next

**Phase 5 — UPI payment-request system** (Add Coins), so wallets can be
funded without needing Prisma Studio.
