# Phase 12 Setup — Testing

## 1. Install test dependencies

```
cd backend
npm install
```

## 2. Run the unit tests (no database needed)

```
npm test
```

These mock Prisma entirely and run in-process — no setup beyond
`npm install`. They cover:

- `wallet.service.spec.ts` — every WalletService guarantee: credit/debit
  math, idempotency (same key twice never double-processes), insufficient
  balance is rejected, and the full reserve → finalize / reverse
  withdrawal lifecycle
- `firebase-auth.guard.spec.ts` — missing/invalid tokens rejected,
  User+Profile+Wallet provisioned together exactly once per identity,
  banned users blocked
- `admin-jwt.guard.spec.ts` — real JWT signing/verification (not
  mocked), proving a token signed with the wrong secret or naming a
  nonexistent admin is rejected
- `tournament.service.spec.ts` — duplicate registration, full slots, and
  closed registration windows are all rejected; the entry fee charged is
  always the server's own record, never anything else
- `payment-request.service.spec.ts` — the "admin cannot accidentally
  credit the same payment twice" guarantee specifically, plus the
  duplicate-pending-request limit from Phase 11

## 3. Run the e2e test (needs a test database)

This one actually boots the full Nest app, so it needs a real reachable
Postgres — **use a separate database from your real dev one**, not the
same database you've been testing Phases 1–11 against.

1. Create a second free Postgres (same place as your first — neon.tech,
   supabase.com, railway.app — just a new project)
2. Temporarily point `DATABASE_URL` in `backend/.env` at it, run
   `npx prisma migrate dev` once against it, then:

```
npm run test:e2e
```

3. Switch `DATABASE_URL` back to your real dev database afterward

This proves the security boundaries actually hold at the HTTP layer, not
just in the mocked unit tests: every `/admin/*` route rejects a missing
or garbage token, player routes reject the same way, and error responses
never leak raw database detail (checked directly in one of the test
assertions).

## 4. Run the Android unit test

In Android Studio: right-click `app/src/test` → **Run Tests**, or from
the command line:

```
cd android
./gradlew test
```

## What these tests do NOT cover

- Full Google Sign-In / Phone-OTP flow (needs a real device + real
  Firebase project — better tested manually per `docs/PHASE2_SETUP.md`)
- UI rendering/interaction tests for the Android screens
- Load/stress testing

For a project this size, the highest-value automated coverage is exactly
where it's concentrated here: the wallet ledger and the two auth
boundaries, since those are where a bug costs real money or exposes
admin functionality. Everything else is lower-stakes and more practically
caught by the manual test steps already in the earlier `docs/PHASE*.md`
files.

## If a test fails

Paste me the exact failure output and I'll fix it.

## What's next

**Phase 13 — Android build/release.** The last phase — produces the
actual APK (with the GitHub Codespaces fallback if a local Android
Studio build doesn't work out for you).
