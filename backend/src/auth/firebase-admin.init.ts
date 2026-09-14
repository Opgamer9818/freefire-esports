import * as admin from 'firebase-admin';

let initialized = false;

// Called once from main.ts before the Nest app boots. Every later file
// that needs Firebase just calls admin.auth() directly — firebase-admin
// keeps a single global instance once initializeApp() has run.
export function initFirebaseAdmin() {
  if (initialized) return;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Missing Firebase env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'FIREBASE_PRIVATE_KEY in backend/.env — see docs/SETUP.md Phase 2 section.',
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Firebase private keys are stored in .env with literal \n escapes —
      // this turns them back into real newlines so the key parses correctly.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  initialized = true;
}
