# Admin Panel

React + Vite + TypeScript + Tailwind. Its own login, completely separate
from player accounts — talks to the same backend but with an admin JWT.

## Pages

Dashboard · Tournaments (list/create/edit/cancel) · Payment Requests
(approve/reject) · Redeem Requests (approve with coin value/reject) ·
Users (search/ban/unban) · Settings (UPI ID, coin rate, withdrawal
limits) · Audit Logs

Results, Withdrawals, Notifications, and Support screens are added when
their backend phases (8, 9, 10) land.

## Before this runs

1. Backend must be running with Phase 7 deployed
2. Create your first admin account — see `docs/PHASE7_SETUP.md`
3. `cp .env.example .env` and point `VITE_API_BASE_URL` at your backend

## Run it

```
npm install
npm run dev
```

Opens at http://localhost:5173.
