# 兩人小帳本

Mobile-first shared expense tracker for Jay and Ling.

Production:

```text
https://moneytrackerprivate.vercel.app/
```

Architecture:

```text
iPhone Safari / PWA -> Vercel frontend -> Supabase Auth + Postgres
```

## Features

- Email/password login for existing Supabase users
- Private ledger access through Supabase RLS and `members`
- Add expenses with date, category, payer, amount, and note
- Payer options: `Jay`, `Ling`, `Jay&Ling`
- Monthly summary and payer totals
- Selectable pie charts:
  - Total category breakdown
  - Payer breakdown
  - Jay category breakdown
  - Ling category breakdown
  - Jay&Ling category breakdown
- Detail filters:
  - User: all, Jay, Ling, Jay&Ling
  - Category: all plus configured categories
  - Date: this month, this week, last week, specific day
- CSV export for the currently filtered detail list
- Quick expense templates and duplicate-to-form flow
- Search and sort monthly details
- PWA manifest and service worker

## Development

```powershell
npm install
npm run dev
```

Windows helper:

```powershell
.\start-dev.cmd
```

Local URLs:

```text
http://127.0.0.1:5175
http://192.168.168.164:5175
```

Build before pushing:

```powershell
npm run build
```

## Environment

Create `.env.local` from `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Required values:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Do not commit `.env.local`, database passwords, or Supabase service role keys.

## Supabase

Run:

```text
supabase/schema.sql
```

If updating an existing database, make sure this migration has been applied:

```sql
alter table public.expenses
add column if not exists payer_label text;
```

Access model:

- Both users must exist in Supabase Auth.
- Both Auth user IDs must be inserted into `public.members`.
- Public signup can stay disabled.
- Non-member users may authenticate, but RLS prevents reading or writing ledger data.

Seed helper:

```text
supabase/seed-members.example.sql
```

## Deployment

Vercel deploys automatically from GitHub `main`.

Required Vercel environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

After changing Vercel environment variables, redeploy.

See:

```text
docs/deploy.md
```

## Maintenance Notes

- The app is designed primarily for iPhone 15 Pro Safari.
- Keep the first screen functional and compact; avoid marketing-style landing sections.
- PWA service worker uses a network-first cache strategy to avoid stale blank pages after deploys.
- Pie/donut charts must handle a single nonzero slice as a visible 100% circle.
- Use the local `svg-pie-chart` skill for chart work.
