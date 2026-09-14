# Phase 2 Setup — Auth + Profile

Assumes Phase 1 is already working (`backend` runs, `/health` returns ok).

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → give it a
   name (e.g. "Free Fire Esports") → finish the wizard (Analytics optional).

## 2. Enable sign-in methods

In your new project: **Authentication → Sign-in method → Add new provider**

- Enable **Google**
- Enable **Phone**

## 3. Register the Android app

1. In Project Settings (gear icon) → **Your apps** → **Add app** → Android
2. Package name: `com.freefireesports.app` (must match exactly)
3. Download **`google-services.json`**
4. Place it at `android/app/google-services.json`

## 4. Get your Web Client ID (needed for Google Sign-In)

1. Project Settings → **General** tab → scroll to "Your apps"
   — or Authentication → Sign-in method → Google → expand it
2. Copy the **Web client ID** (looks like `123456-abc...apps.googleusercontent.com`)
3. Open `android/app/src/main/res/values/strings.xml` and paste it in place
   of `REPLACE_WITH_YOUR_FIREBASE_WEB_CLIENT_ID`

## 5. Get backend service account credentials

1. Project Settings → **Service accounts** tab
2. Click **Generate new private key** — downloads a JSON file
3. Open that JSON file and copy three values into `backend/.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n`
     characters exactly as they appear in the JSON file)

## 6. Restart the backend

```
cd backend
npm install
npm run start:dev
```

No new migration needed — Phase 1's schema already has everything Phase 2 uses.

## 7. Open the Android app

1. Open Android Studio → **Open** → select the `android` folder
2. Let Gradle sync (first sync downloads dependencies, takes a few minutes)
   — if Android Studio offers to update the Gradle wrapper/plugin versions,
   accepting is safe
3. Run on an emulator (Pixel with Play Store image — Google Sign-In needs
   Play Services)

## 8. Test the full loop

1. App opens on the login screen → tap **Continue with Google** or
   **Continue with Phone**
2. Sign in
3. You land on **Set up your profile** — fill in Free Fire UID + IGN → Save
4. You land on a **You're signed in** placeholder screen

If step 3's save succeeds, the entire chain worked: Android → Firebase →
your NestJS backend → Postgres, round trip.

## If something goes wrong

- **Gradle sync fails on Firebase plugin** — double-check
  `google-services.json` is actually at `android/app/google-services.json`.
- **Google Sign-In shows "unexpected credential type" or fails silently** —
  double check the Web Client ID in `strings.xml` is the **Web** client ID,
  not the Android one.
- **"Missing Firebase env vars" error on backend startup** — check all three
  `FIREBASE_*` values are filled in `backend/.env`.
- **401 on save from the Android app** — check the backend terminal for the
  real error; paste it to me and I'll fix it.
- Running on a real phone instead of the emulator: change `API_BASE_URL` in
  `android/app/build.gradle.kts` from `10.0.2.2` to your computer's LAN IP.

## What's next

Once the full loop works, say the word and I'll start **Phase 3 —
Tournament system**.
