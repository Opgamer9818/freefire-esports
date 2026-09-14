# Free Fire Esports Tournament App

Real-money-adjacent esports tournament platform for Free Fire — Android app,
NestJS backend, React admin panel. Built in phases; see phase status below.

## ⚠️ Read before Phase 5 / Phase 9

Your current wallet design (coins bought with real ₹, entry fees, cash
withdrawal to UPI) is very close to what India's Promotion and Regulation of
Online Gaming Act, 2025 (in force 1 May 2026) restricts for real-money games.
Get an Indian gaming/tech lawyer to confirm your setup before wiring up real
UPI payments (Phase 5) or withdrawals (Phase 9). Everything else is unaffected.

## Project structure

```
/backend    NestJS + Prisma + PostgreSQL — the only thing with money authority
/android    Kotlin + Jetpack Compose — scaffolded starting Phase 2
/admin      React admin dashboard — scaffolded starting Phase 7
/docs       Setup guides, API notes
```

## Phase status

- [x] Phase 1 — Architecture + stack + database
- [x] Phase 2 — Authentication + profile
- [x] **Phase 3 — Tournament system** (this delivery)
- [x] **Phase 4 — Wallet + ledger** (this delivery)
- [x] **Phase 5 — UPI payment-request system** (this delivery)
- [x] **Phase 6 — Redeem-code system** (this delivery)
- [x] **Phase 7 — Admin panel** (this delivery)
- [x] **Phase 8 — Results + prizes** (this delivery)
- [x] **Phase 9 — Withdrawals** (this delivery)
- [x] **Phase 10 — Notifications + support** (this delivery)
- [x] **Phase 11 — Security hardening** (this delivery)
- [x] **Phase 12 — Testing** (this delivery)
- [x] **Phase 13 — Android build/release** (this delivery)

**All 13 phases complete.** See `RELEASE_CHECKLIST.md` before this goes
in front of real users.

## What's included so far

**Phase 1** — Database schema (19 models), a minimal NestJS server with a
`/health` endpoint proving the server boots and the DB connection works.

**Phase 2** — Firebase-backed auth (Google Sign-In + Phone/OTP) on both
sides:
- Backend: `FirebaseAuthGuard` verifies tokens on every protected route
  and auto-provisions User + Profile + Wallet on first login; `GET/PUT
  /profile` for reading and updating profile data.
- Android: a real (not mocked) Kotlin + Jetpack Compose app — login screen,
  phone/OTP flow, profile setup screen wired to the live backend, both
  premium themes defined and ready to switch between.

**Phase 3 + 4** — Tournaments and the wallet ledger, wired together:
- Backend: `WalletService` is the only code path allowed to change a
  balance (atomic, row-locked, idempotent). `TournamentService` handles
  listing, team creation/joining, and one shared registration path that
  atomically deducts the entry fee (via WalletService), fills a slot, and
  creates the registration — solo and team formats both funnel through it.
- Android: real Home screen (tournament list + wallet chip), tournament
  detail, team creation/join/roster screen, and a wallet screen showing
  balance + transaction history.

**Phase 5 + 6** — Add Coins (UPI) and Redeem Codes, both admin-approved:
- Backend: `SettingsService` (UPI ID / coin rate — admin-editable, not
  hard-coded), `PaymentRequestService` and `RedeemService`, each with a
  user-facing create/track path and an admin approve/reject path that
  credits coins through `WalletService`. Admin routes are protected by a
  **provisional** `AdminRoleGuard` (checks `User.role === ADMIN`) — Phase
  7 replaces this with the fully separate AdminUser login the project's
  own rules call for.
- Android: Add Coins screen with a real UPI QR code + deep-link "Pay via
  UPI app" button (amount fixed, not editable in-app) and UTR submission;
  Redeem Code screen with status tracking.

No admin panel UI yet (Phase 7) — `docs/PHASE3_4_SETUP.md` and
`docs/PHASE5_6_SETUP.md` cover testing via Prisma Studio and curl in the
meantime.

**Phase 7** — The real admin panel, with the fully separate admin login
the project's rules always called for:
- Backend: `AdminAuthService`/`AdminJwtGuard` (own username+password,
  own JWT — zero overlap with player/Firebase auth), tournament
  create/edit/cancel (cancel auto-refunds every paid registration),
  user search/ban/unban, dashboard stats, settings read/write, and audit
  log reads. The Phase 5/6 payment and redeem approval endpoints now use
  this real guard instead of the provisional role check, and every
  approve/reject/cancel/ban action writes an audit log entry.
- `admin/` — a full React + Vite + Tailwind app: Login, Dashboard,
  Tournaments (list/create/edit/cancel), Payment Requests, Redeem
  Requests, Users, Settings, Audit Logs.
- First admin account is created via `npm run create-admin` in
  `backend/` (interactive CLI, hashes the password) — there's
  intentionally no signup screen.

See `docs/SETUP.md` (Phase 1), `docs/PHASE2_SETUP.md` (Phase 2),
`docs/PHASE3_4_SETUP.md` (Phase 3+4), `docs/PHASE5_6_SETUP.md`
(Phase 5+6), `docs/PHASE7_SETUP.md` (Phase 7), and
`docs/PHASE8_9_SETUP.md` (Phase 8+9), `docs/PHASE10_SETUP.md`
(Phase 10), `docs/PHASE11_SETUP.md` (Phase 11, includes a full
security checklist), `docs/PHASE12_SETUP.md` (Phase 12), and
`docs/PHASE13_SETUP.md` (Phase 13 — three different paths to a real
APK) for exact setup steps.

**Phase 13** — Release build config (real ProGuard/R8 keep rules for
Retrofit/Gson/Firebase, a signing-config template that never commits a
real keystore), a GitHub Actions workflow that builds and hands you a
real downloadable debug APK with zero local setup, Codespaces
instructions as a fallback, and a `RELEASE_CHECKLIST.md` covering
everything specific to this project (not generic Play Store advice)
before real users touch it.

---

## Project status: all 13 phases complete

Backend (NestJS + Prisma + Postgres), Android app (Kotlin + Compose),
and admin panel (React) are all functionally complete per the original
spec. Read `RELEASE_CHECKLIST.md` — especially the legal section — before
any of this handles real money for real users.

**Phase 12** — Automated tests targeting exactly the guarantees the
project's rules care most about: `WalletService` (idempotency,
insufficient-balance rejection, the full reserve/finalize/reverse
withdrawal lifecycle), both auth guards (missing/invalid/forged tokens
rejected, zero overlap between player and admin auth), tournament
registration (no duplicates, no full-tournament joins, entry fee always
server-derived), and the specific "admin cannot double-credit the same
payment" guarantee. An e2e suite proves the auth boundaries hold at the
real HTTP layer, not just in mocks.

**Phase 11** — Helmet security headers, configurable CORS, a global
exception filter (no more raw errors ever reaching a client), the rate
limiter actually enforced (it was configured but never wired up before
this), stricter limits on login/payment/redeem/withdrawal endpoints, a
duplicate-payment-request guard, validated+audited settings updates, and
fail-fast startup checks for missing/weak environment variables.

**Phase 10** — Notifications + support:
- `NotificationService` (global) writes the in-app record first, then
  makes a best-effort FCM push attempt that can never block the action
  that triggered it. Hooked into every player-facing event: payments,
  redeems, registration, cancellation/refund, results/prizes,
  withdrawal status changes, bans.
- Android: real FCM service (foreground push + token upload), a
  notification center with an unread badge on Home, and a Support screen
  (submit ticket, see replies).
- Admin panel gained a Support Tickets queue (filter by status, reply,
  resolve).

**Phase 8 + 9** — Results/prizes and withdrawals, both money-out paths:
- `WalletService` gained `reserve`/`finalizeReservedDebit`/`reverseReserved`
  alongside `credit`/`debit`, all sharing the same locked, idempotent
  writer — withdrawals reserve funds the instant they're requested, so
  the same balance can never be double-spent while a payout is pending.
- Admin publishes tournament results in a batch; each row is locked the
  moment its prize is actually credited, so re-publishing (e.g. to fix a
  typo) can never double-pay a winner.
- Android: real Withdraw screen; admin panel gained a per-tournament
  Results page and a Withdrawals pipeline (Approve → Processing → Paid,
  or Reject at any point before Paid).
