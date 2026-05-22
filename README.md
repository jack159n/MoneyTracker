# Our Ledger

A small shared expense tracker for two people, built as a mobile-first PWA demo.

## Features

- Add expenses with date, category, payer, and split members
- Monthly summary
- Simple settlement calculation
- Local browser storage for demo use
- CSV export
- PWA manifest and service worker shell

## Development

```powershell
npm install
npm run dev
```

The included Windows helper starts Vite on the local network:

```powershell
.\start-dev.cmd
```

## Next Step

Replace `localStorage` with Supabase tables for shared cloud sync.

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Enable Email Auth in Supabase Authentication.
4. Sign in once with both emails from the app.
5. In Supabase Auth > Users, copy both user IDs.
6. Insert one couple and two `members` rows using the commented setup block at the bottom of `supabase/schema.sql`.
7. Create `.env.local` from `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Then fill in:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Only users listed in `members` can read or write ledger data. Other signed-in users will see a locked screen.
