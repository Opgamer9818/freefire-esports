# Release Checklist

Specific to this project — not a generic "how to publish an app" guide.

## Legal — read this section first

- **India's Promotion and Regulation of Online Gaming Act, 2025** (in
  force 1 May 2026) restricts real-money online games — flagged in
  detail back at Phase 1. This is still unresolved for your current
  design (paid entry + UPI cash withdrawal). Get an Indian gaming/tech
  lawyer to confirm your setup before real money moves through this app.
- **Google Play's own listing policy** has historically not allowed
  real-money-gaming apps at all, requiring direct APK distribution
  (sideloading) instead. Google has been piloting a framework to allow
  self-declared, third-party-certified "games of skill" onto Play — but
  that framework itself requires the app to be declared legally
  permissible under applicable law, which loops straight back to the
  point above. Don't assume Play Store distribution is available for
  this app's current design without checking current policy directly.
- Neither of these blocks building or testing the app — only real-money
  operation and/or Play Store distribution specifically.

## Before any real user touches this

- [ ] Legal review above is resolved one way or another
- [ ] Backend deployed somewhere with HTTPS (Railway/Render/etc.), not
      running on your laptop
- [ ] `API_BASE_URL` in `android/app/build.gradle.kts` points at that
      real URL, not `10.0.2.2`
- [ ] Firebase project is on the **Blaze** (pay-as-you-go) plan if you
      expect real phone/OTP volume — the free Spark plan has limits
- [ ] `ADMIN_JWT_SECRET` in production is a fresh, long random value —
      not whatever you used for local testing (`openssl rand -hex 32`)
- [ ] Your own admin account (`npm run create-admin`) uses a strong,
      unique password
- [ ] `ALLOWED_ORIGINS` in the backend `.env` is set to your real admin
      panel domain (Phase 11) — don't leave CORS wide open in production
- [ ] Database backups are enabled on whichever Postgres host you chose
- [ ] Real app icon replaces the placeholder (Android Studio → right
      click `res` → New → Image Asset)
- [ ] Privacy Policy and Terms of Service pages exist somewhere public —
      required by Play Store (if used) and generally by Firebase/Google
      Sign-In's own terms, and referenced in the app per Section 37/48 of
      the original project spec
- [ ] Owner's real UPI ID and payment instructions are set correctly in
      Admin → Settings (not the placeholder from Phase 5)

## Quality pass

Everything in this list has working code behind it from Phases 1–12 —
this is about actually clicking through each one yourself before anyone
else does:

- [ ] Full signup → profile → browse → join → pay → get approved → play
      → see results → get prize → withdraw loop, start to finish
- [ ] Both premium themes render correctly
- [ ] Admin: create/edit/cancel a tournament, approve/reject a payment
      and a redeem code, ban/unban a user, process a withdrawal end to
      end, publish results
- [ ] Duplicate-prevention: try registering twice, approving the same
      request twice, submitting the same redeem code twice — all should
      be rejected (Phase 12's tests cover this in code; this is the
      manual click-through version)
- [ ] Push notifications arrive on a real device
- [ ] Support ticket round-trip (submit → admin replies → player sees it)

## Ongoing (not blocking, but worth knowing about)

- No automated CI test run on every push yet — Phase 12 gave you the
  tests, wiring a GitHub Actions job to run `npm test` automatically is
  a natural next step if you keep developing this
- No load testing — fine at small scale, worth revisiting if the player
  base grows significantly
- Consider field-level encryption for the stored redeem codes and other
  sensitive fields if you want to go beyond what's here
