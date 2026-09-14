# Phase 7 Setup — Admin Panel

No new migration this phase — everything needed (AdminUser, Ban,
AdminAction) already existed in the schema.

## 1. Create your first admin account

This is the real, separate admin login the project's security rules call
for — nothing to do with your Firebase player account.

```
cd backend
npm install
npm run create-admin
```

Follow the prompts (username + password). Run it again any time to reset
a password.

## 2. Restart the backend

```
npm run start:dev
```

## 3. Set up the admin app

```
cd ../admin
cp .env.example .env
npm install
npm run dev
```

Opens at http://localhost:5173. Sign in with the username/password from
step 1.

## 4. What changed for Phase 5/6 testing

The curl-based admin approval from `docs/PHASE5_6_SETUP.md` is no longer
needed — approve/reject Payment Requests and Redeem Requests directly from
the **Payment Requests** and **Redeem Requests** pages now.

If you set your player account's `role` to `ADMIN` in Prisma Studio back
in Phase 5/6 for testing, you can set it back to `USER` now — the admin
panel doesn't use that field at all.

## 5. Test each screen

- **Dashboard** — numbers should match what's actually in your database
- **Tournaments** — create one from the form, confirm it shows up for
  players in the Android app; edit it; cancel a paid one and confirm
  every registered player got refunded (check their Wallet transactions)
- **Payment Requests / Redeem Requests** — approve one from each, confirm
  the coins land in the right player's wallet
- **Users** — search for a player, ban them, confirm they can't register
  for tournaments anymore (their financial history stays intact — banning
  never deletes wallet/transaction records)
- **Settings** — change the coin rate, confirm a new Add Coins request in
  the Android app reflects the new ₹ amount
- **Audit Logs** — every action above should show up here with your
  admin username attached

## If something goes wrong

Paste me the exact error and I'll fix it.

## What's next

**Phase 8 — Results + prizes.** Admin enters final standings, the backend
auto-credits every winner through the same WalletService, and it's
protected against double-crediting the same result twice.
