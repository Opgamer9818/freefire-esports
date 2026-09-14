# Android App

Kotlin + Jetpack Compose. Phase 2 delivers: Google Sign-In, Phone/OTP
sign-in, and a profile setup screen that reads/writes the real backend.

## Structure

```
auth/        AuthRepository (Firebase) + AuthViewModel
network/     Retrofit client, auth interceptor, ProfileApi
profile/     ProfileRepository + ProfileViewModel
navigation/  NavGraph — login -> phone auth -> profile setup -> home
screens/     Compose screens
ui/theme/    Both premium themes (Black+Gold, Dark Esports)
```

## Before this builds, you need to:

1. Add an Android app to your Firebase project and download
   `google-services.json` into `app/` (see `docs/PHASE2_SETUP.md`).
2. Paste your Firebase **Web client ID** into
   `app/src/main/res/values/strings.xml` (`web_client_id`).
3. Have the backend running (Phase 1 + Phase 2 modules).

Full steps: `docs/PHASE2_SETUP.md`.

## What's still a placeholder

- Launcher icon is a plain vector mark — swap via Android Studio's Image
  Asset tool once you have real branding.
- Home screen is a one-line placeholder — real content starts Phase 3.
- `API_BASE_URL` in `app/build.gradle.kts` points at the Android emulator's
  view of localhost (`10.0.2.2`). Change it if you're running on a real
  device or a deployed backend.
