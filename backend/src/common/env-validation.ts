const REQUIRED_VARS = ['DATABASE_URL', 'ADMIN_JWT_SECRET', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `\nMissing required environment variable(s): ${missing.join(', ')}\n` +
        'Check backend/.env against backend/.env.example — see docs/SETUP.md and docs/PHASE2_SETUP.md.\n',
    );
    process.exit(1);
  }

  if (process.env.ADMIN_JWT_SECRET && process.env.ADMIN_JWT_SECRET.length < 32) {
    // eslint-disable-next-line no-console
    console.warn(
      '\nWarning: ADMIN_JWT_SECRET is shorter than recommended (32+ random characters). ' +
        'Generate a strong one before deploying somewhere real, e.g.: openssl rand -hex 32\n',
    );
  }
}
