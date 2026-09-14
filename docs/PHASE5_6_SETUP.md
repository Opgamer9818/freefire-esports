# Phase 5 + 6 Setup — UPI Add Coins + Redeem Codes

## 1. Run the new migration

The schema gained one field (`RedeemRequest.code`, so admins can actually
see the code to go verify it — a hash alone can't be reversed).

```
cd backend
npx prisma migrate dev --name add_redeem_code_field
npm run start:dev
```

## 2. Give yourself admin access (temporary, until Phase 7)

Approving payments/redeem codes needs an admin. There's no separate admin
login yet (Phase 7 adds the real one — its own username/password, nothing
to do with your player account). For now:

```
npx prisma studio
```

Open **User**, find your row, change `role` from `USER` to `ADMIN`, save.
Your same player account can now call the `/admin/...` endpoints too.

## 3. Test Add Coins (Phase 5)

1. In the app: **Wallet → Add Coins** → enter a coin amount → **Continue
   to Payment**
2. You'll see a real UPI QR code and a "Pay via UPI app" button (opens
   whatever UPI app is installed, amount pre-filled, not editable)
3. This won't complete a real payment against a fake/test UPI ID — that's
   expected. Just note the request appears under "Your requests" as
   `PENDING`
4. **Approve it** — since there's no admin UI yet, use any API client
   (curl, Postman, or your browser's dev tools) against your backend:

   ```
   curl -X POST http://localhost:3000/admin/payment-requests/<requestId>/approve \
     -H "Authorization: Bearer <your Firebase ID token>" \
     -H "Content-Type: application/json" \
     -d '{"note": "test approval"}'
   ```

   Getting a token quickly: add a temporary `console.log(await
   auth.currentUser?.getIdToken())` anywhere in the Android app, run it,
   copy the token from Logcat. (Remove the log line after.)

5. Confirm coins landed: **Home** → wallet balance increased by exactly
   the requested amount, and **Wallet** shows a `COIN_PURCHASE`
   transaction

## 4. Test Redeem Code (Phase 6)

1. **Wallet → Redeem Code** → enter any text → **Submit**
2. Same admin-approval step as above, but against
   `/admin/redeem-requests/<id>/approve` with body
   `{"approvedCoins": 100}` — the coin value is never taken from what the
   user typed, only from what the admin enters here
3. Try submitting the exact same code text twice — the second one should
   be rejected as a duplicate

## What to check specifically (money correctness)

- Approving the same payment/redeem request twice is rejected (call the
  same approve endpoint again — second call should fail, balance
  shouldn't move twice)
- Rejecting a request never touches the wallet
- The coin amount credited always matches the request/admin-approved
  value exactly, never something the client could have altered

## If something goes wrong

Paste me the exact error and I'll fix it.

## What's next

**Phase 7 — Admin panel.** This replaces the curl-based testing above
with an actual React dashboard, and adds the real separate admin login.
