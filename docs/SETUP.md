# Phase 1 Setup — Get the backend running

Follow these in order. Each step says what you're doing and why.

## 1. Install Node.js

You need Node.js 20 or newer.
Download from https://nodejs.org (choose the LTS version) and install it
like any normal program. Confirm it worked by opening a terminal and running:

```
node -v
```

You should see something like `v20.x.x`.

## 2. Get a Postgres database

You don't need to install Postgres yourself — use a free hosted one:

1. Go to https://neon.tech (or supabase.com, or railway.app — any works)
2. Sign up, create a new project
3. Find the "Connection string" (sometimes called "Connection URI") —
   it looks like `postgresql://user:password@host/dbname`
4. Copy it — you'll need it in step 4

## 3. Install project dependencies

Open a terminal, go into the `backend` folder, and run:

```
cd backend
npm install
```

This downloads everything the project needs. Takes a minute or two.

## 4. Set up your environment file

Still inside `backend`:

```
cp .env.example .env
```

Open the new `.env` file in any text editor and paste your Postgres
connection string from step 2 into `DATABASE_URL`. Leave the Firebase and
admin-JWT lines blank for now — those get filled in Phase 2 and Phase 7.

## 5. Create the database tables

Still inside `backend`:

```
npx prisma migrate dev --name init
```

This reads `prisma/schema.prisma` and creates all the tables in your
Postgres database. If this succeeds, your database is fully set up.

## 6. Start the server

```
npm run start:dev
```

You should see `Backend running on http://localhost:3000` in the terminal.

## 7. Confirm it's working

Open a browser (or use curl) and go to:

```
http://localhost:3000/health
```

You should see something like:

```json
{ "status": "ok", "database": "connected", "users": 0, "timestamp": "..." }
```

If you see that, Phase 1 is fully working — the server runs and the
database connection + schema are both correct.

## If something goes wrong

- **`npx prisma migrate dev` fails to connect** — double check `DATABASE_URL`
  in `.env` is exactly what your Postgres host gave you, no extra spaces.
- **`npm install` errors** — confirm `node -v` shows 20 or higher.
- Paste me the exact error message and I'll fix it.

## What's next

Once `/health` works, say the word and I'll start **Phase 2 — Authentication
+ profile**, which is where the Android app scaffolding also begins.
