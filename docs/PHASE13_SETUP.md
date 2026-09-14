# Phase 13 Setup — Getting an actual APK

Three ways to get a real, installable `.apk` file. Try them in this
order.

---

## Path A — GitHub Actions (easiest, no local install at all)

This builds the APK on GitHub's servers and hands you a download link.
Needs a GitHub repo with this code pushed to it.

1. **Push this project to a GitHub repo** (private is fine).

2. **Add two repo secrets** — Settings → Secrets and variables → Actions
   → New repository secret:

   - `GOOGLE_SERVICES_JSON` — base64-encoded contents of your real
     `android/app/google-services.json` (from Phase 2 setup). Generate
     the base64 with:
     ```
     base64 -i android/app/google-services.json   # Mac
     base64 -w0 android/app/google-services.json   # Linux
     ```
     Copy the output and paste it as the secret value.

   - `WEB_CLIENT_ID` — your Firebase Web client ID (same value you put
     in `strings.xml` back in Phase 2).

3. **Run the workflow** — Actions tab → "Android Build" → Run workflow.
   (It also runs automatically on every push to `main` that touches the
   `android/` folder.)

4. When it finishes (green checkmark, a few minutes), open the run →
   scroll to **Artifacts** → download `freefire-esports-debug-apk`.
   Unzip it — that's your real `app-debug.apk`.

5. **Install it on your phone**: transfer the file over, tap it, allow
   "install from unknown sources" if prompted. Point the app at your
   deployed backend first (see below) — it won't be able to reach
   `10.0.2.2` from a real network.

---

## Path B — Android Studio, locally

The normal path, and the only one of the three with a visual UI and
emulator.

1. Install [Android Studio](https://developer.android.com/studio)
2. **Open** → select the `android` folder
3. Let Gradle sync — first sync downloads dependencies (a few minutes).
   If prompted to update Gradle/AGP/Kotlin versions or to fix the
   wrapper, accept it — that's expected and safe
4. Complete Phase 2 setup first if you haven't (Firebase project,
   `google-services.json`, Web Client ID) — this app can't build
   correctly without those regardless of which path you use
5. **Build → Generate Signed Bundle / APK** for a real release build, or
   just **Run** (▶) to install a debug build straight to a connected
   phone or emulator

---

## Path C — GitHub Codespaces (fallback if A and B don't work out)

A full Linux dev environment in your browser, with internet access —
useful since it can run a real Gradle build with no local install at
all, command-line only (no emulator/UI).

1. Push this project to GitHub (same as Path A, step 1)
2. On the repo page: **Code** → **Codespaces** → **Create codespace on
   main**
3. Once it opens (a VS Code-like editor in your browser), open a
   terminal and install the Android SDK command-line tools:
   ```
   sudo apt-get update && sudo apt-get install -y openjdk-17-jdk unzip
   mkdir -p ~/android-sdk/cmdline-tools
   cd ~/android-sdk/cmdline-tools
   curl -o tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
   unzip tools.zip && mv cmdline-tools latest
   export ANDROID_HOME=~/android-sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   yes | sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```
4. This repo's committed `gradle-wrapper.jar` is a placeholder (Claude's
   sandbox can't produce binary files) — regenerate it once using a
   system Gradle:
   ```
   sudo apt-get install -y gradle
   cd android
   gradle wrapper --gradle-version 8.9
   ```
5. Add your Firebase files (upload `google-services.json` into
   `android/app/`, and fill `strings.xml` with the Web Client ID —
   easiest via the Codespaces file explorer)
6. Build:
   ```
   ./gradlew assembleDebug
   ```
7. Download the APK from `android/app/build/outputs/apk/debug/` via the
   Codespaces file explorer (right-click → Download)

---

## Before this is genuinely usable off your own WiFi

`API_BASE_URL` in `android/app/build.gradle.kts` still points at
`10.0.2.2` (emulator-only). Before testing on a real phone or handing
this to anyone else:

1. Deploy the backend somewhere reachable (Railway/Render, per the
   Phase 1 architecture notes) with HTTPS
2. Change `API_BASE_URL` to that real URL
3. Rebuild

## See also

`RELEASE_CHECKLIST.md` at the project root for everything else worth
reviewing before this goes in front of real users — themed around what's
specific to this project, not a generic Play Store tutorial.

## If a build fails

Paste me the exact error (from whichever path you tried) and I'll fix
the underlying code — none of these three paths change what's actually
being built, only how.
