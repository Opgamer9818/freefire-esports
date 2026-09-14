# Phase 11 Setup — Security Hardening

No new migration, no new screens — this phase tightens what already
exists rather than adding features.

## 1. Install and restart

```
cd backend
npm install
npm run start:dev
```

If you see a "Missing required environment variable(s)" error at
startup, that's the new fail-fast check working correctly — fill in the
listed variable(s) in `.env` and restart.

## 2. What changed

- **Helmet** — sets standard security headers (X-Frame-Options, etc.) on
  every response.
- **CORS** — now configurable via `ALLOWED_ORIGINS` in `.env` for
  production; unset defaults to allowing everything, which is fine for
  local development.
- **Global exception filter** — every unhandled error now returns a
  generic, safe message to the client (no stack traces, no raw
  Prisma/database error text) while the full detail still goes to your
  server logs.
- **Rate limiting actually enforced** — the throttler was configured
  back in Phase 1 but never wired up as an active guard. It's global now
  (100 requests/minute/IP by default), with stricter limits on the
  highest-value targets:
  - Admin login: 5/minute (brute-force resistance)
  - Payment request creation: 10/minute
  - Redeem code submission: 10/minute
  - Withdrawal requests: 5/minute
- **Duplicate payment request guard** — a player can't have more than 3
  payment requests pending review at once.
- **Settings updates** are now validated (no more silently saving a
  string where a number was expected) and write to the audit log, which
  was missing before.
- **Startup env validation** — the server refuses to start with a clear
  error if `DATABASE_URL`, `ADMIN_JWT_SECRET`, or the Firebase vars are
  missing, and warns if `ADMIN_JWT_SECRET` looks weak.

## 3. Security checklist against the project's own rules

| Requirement | Status |
|---|---|
| Client never has authority over balances/fees/prizes | ✅ — all money logic lives in `WalletService`, server-side only |
| Every financial operation is atomic + idempotent | ✅ — `WalletService.write()` is the only writer, row-locked, idempotency-keyed |
| Admin auth fully separate from user auth | ✅ — `AdminUser` table, its own JWT, since Phase 7 |
| Passwords hashed | ✅ — bcrypt, cost factor 12 |
| No secrets in the Android APK | ✅ — only a public Firebase config and API base URL ship in the app |
| Audit logs on sensitive actions | ✅ — payment/redeem/withdrawal decisions, tournament create/edit/cancel, results, bans, settings |
| Duplicate wallet credits prevented | ✅ — idempotency keys on every ledger write |
| Duplicate prize/redeem/payment processing prevented | ✅ — `processed` flags + idempotency keys |
| Rate limiting | ✅ — global + per-route (this phase) |
| Input validation on every endpoint | ✅ — DTOs + global `ValidationPipe` |
| SQL injection protection | ✅ — Prisma parameterizes all queries, including the raw `FOR UPDATE` locks |
| Raw errors never shown to users | ✅ — global exception filter (this phase) |
| HTTPS | ⚠️ Your hosting provider's job — Railway/Render/etc. terminate HTTPS automatically once deployed; nothing to do in code |
| Full penetration testing, WAF, DDoS protection | ⚠️ Out of scope for app code — typically infra/hosting-layer concerns for a project this size |

## If something goes wrong

Paste me the exact error and I'll fix it.

## What's next

**Phase 12 — Testing.** Automated tests specifically targeting the
things this checklist above claims are true — proving them, not just
asserting them.
