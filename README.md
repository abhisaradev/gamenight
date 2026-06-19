# 🎲 Game Night

A dark-themed, mobile-first host toolkit for game night. Browse and run party
games (Trivia, Would You Rather, Wavelength, 5 Second Challenge, and more) from
your phone. Anyone with the link can play; the host can add / edit / delete
questions and create new game sections from a password-protected admin panel.

Built with **Next.js 14 (App Router)**, **Supabase** (Postgres), **Tailwind
CSS**, and deployed on **Vercel**.

---

## Tech stack

- Next.js 14 App Router (React 18, TypeScript)
- Supabase Postgres — all game content lives in the database
- Tailwind CSS — dark theme, mobile-first, max-width 480px
- No auth library — the admin panel is gated by a single `ADMIN_PASSWORD`
  checked server-side via `/api/auth`

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=choose-a-password
```

### 4. Create the database tables

Run the migration in **Supabase → SQL Editor** — paste the contents of
[`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) and run
it. (Or, with the Supabase CLI linked: `supabase db push`.)

This creates `game_registry` and `game_content` with public RLS policies (the
app has no user auth; the admin gate is the `ADMIN_PASSWORD`).

### 5. Seed the default game content

```bash
npm run seed
# or: npx ts-node scripts/seed.ts
```

The seed is **idempotent** — it skips if the registry is already populated. To
wipe the built-in games and reseed:

```bash
npx ts-node scripts/seed.ts --force
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin panel is at
[/admin](http://localhost:3000/admin).

---

## Project structure

```
app/
  page.tsx                 # home — grid of game cards
  game/[id]/page.tsx       # public game screen (server) …
  game/[id]/GameClient.tsx # … + interactive client (picker, dial, timer)
  admin/page.tsx           # password gate + game list
  admin/[id]/page.tsx      # manage one game (add / bulk / delete / reset)
  admin/new-game/page.tsx  # create a custom game section
  api/auth/route.ts        # checks ADMIN_PASSWORD
lib/
  supabase.ts              # Supabase client + types
  queries.ts               # server-side reads
  games.ts                 # rules text, trivia categories, accents
  seed-data.ts             # all default game content
scripts/seed.ts            # idempotent seeder
supabase/migrations/001_init.sql
```

---

## Deploy to Vercel

### Option A — CLI

```bash
npm i -g vercel
vercel            # link / create the project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ADMIN_PASSWORD
vercel --prod     # production deploy
```

### Option B — Dashboard

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add the three environment variables under **Settings → Environment
   Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
4. Deploy.

> Run the SQL migration (step 4) and the seed (step 5) against your Supabase
> project once — they're independent of where the app is hosted.

---

## Notes

- All game data is stored in Supabase, so edits made in the admin panel persist
  across every device (unlike the original single-file localStorage version).
- The anon key is used for both reads and writes; the database RLS policies
  allow public access by design. Keep your `ADMIN_PASSWORD` private — it's what
  stops casual users from reaching the edit forms.
