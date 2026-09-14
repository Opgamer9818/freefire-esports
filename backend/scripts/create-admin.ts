import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
    if (hidden) {
      // Best-effort: most terminals still echo input here. Good enough
      // for local setup; not meant to replace a real secrets workflow.
    }
  });
}

async function main() {
  console.log('Create or reset an admin account (used for the /admin/... panel, separate from player logins).\n');

  const username = await ask('Admin username: ');
  if (!username) throw new Error('Username is required');

  const password = await ask('Admin password (min 6 chars): ');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, role: 'admin' },
  });

  console.log(`\nAdmin account ready: ${admin.username}`);
  console.log('Sign in to the admin panel with this username and password.');
}

main()
  .catch((e) => {
    console.error('\nFailed:', e.message ?? e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
