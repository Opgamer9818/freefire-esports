# Phase 10 Setup — Notifications + Support

## 1. Run the new migration

Profile gained one field (`fcmToken`, so the backend has somewhere to
send push notifications).

```
cd backend
npx prisma migrate dev --name add_fcm_token
npm run start:dev
```

## 2. Rebuild the Android app

No new setup needed beyond what Phase 2 already configured — push uses
the same Firebase project. Just rebuild/reinstall so the new
`POST_NOTIFICATIONS` permission and FCM service are picked up.

On first launch after this update, Android 13+ will prompt for
notification permission — accept it to actually see push notifications
(in-app notifications work either way).

## 3. Test in-app notifications

Trigger any of these and check the bell icon on Home (and the
Notifications screen) for a new entry:

- Submit a payment request → approve/reject it from the admin panel
- Submit a redeem code → approve/reject it
- Register for a tournament
- Cancel a tournament with paid registrations (refund notice)
- Publish tournament results with a prize
- Request a withdrawal → move it through Approve/Processing/Paid or Reject
- Ban/unban a test user

Each should produce a notification for the affected player, and the
unread badge on Home should update.

## 4. Test push notifications

Push only works on a real device or an emulator with Google Play
Services, since it needs a live FCM token:

1. Open the app, sign in — this uploads the device's FCM token
   automatically
2. Put the app in the background (don't kill it)
3. Trigger one of the events above from the admin panel
4. A system notification should appear; tapping it opens the app

If nothing appears: confirm notification permission was granted
(Android Settings → Apps → Free Fire Esports → Notifications), and check
the backend logs for `admin.messaging().send()` errors — a stale/missing
token is the most common cause and is expected to fail silently by
design (it never blocks the underlying action, like a payment approval).

## 5. Test Support

1. In the app: **Home → Support** → pick a category, write a message,
   submit
2. In the admin panel: **Support** tab → find the ticket → write a reply
   → **Reply** (keeps it open) or **Resolve** (closes it out)
3. Confirm the player got a notification and can see the reply on their
   Support screen

## If something goes wrong

Paste me the exact error and I'll fix it.

## What's next

**Phase 11 — Security hardening.** This phase mostly tightens what
already exists (rate limiting specifics, input validation review, secret
handling) rather than adding new screens.
