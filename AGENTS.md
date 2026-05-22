# MoneyTracker Agent Guide

## Project Shape

- React + Vite PWA.
- Supabase handles Auth and Postgres.
- Vercel deploys GitHub `main` to production.
- Primary target device is iPhone 15 Pro Safari.

## Commands

Use Windows-safe commands:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Local dev:

```powershell
.\start-dev.cmd
```

Always run `npm run build` before committing frontend changes.

## Data Model

Core tables:

- `members`: maps Supabase `auth.users.id` to the private couple ledger.
- `expenses`: stores date, title, amount, category, note, payer member, and `payer_label`.
- `expense_splits`: legacy table from the earlier split-expense design. The app no longer writes to it.

Current product behavior:

- This is a shared spending log, not debt settlement.
- No split/share UI.
- Payer options are `Jay`, `Ling`, and `Jay&Ling`.
- The default payer must be the signed-in member. Manual override is allowed.
- RLS is the real access boundary; UI should still avoid exposing signup.

## Supabase Rules

- Never commit `.env.local`.
- Never commit database passwords or service role keys.
- Frontend may use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- If a user can log in but is not in `members`, show the locked screen.
- Existing database deployments need:

```sql
alter table public.expenses
add column if not exists payer_label text;
```

## UI Guidance

- Optimize for repeated iPhone use.
- Keep controls compact and thumb-friendly.
- Use existing restrained palette and 8px radius.
- Avoid adding landing pages or explanatory in-app copy.
- Detail filters default to:
  - User: all
  - Category: all
  - Date: this month

## Charts

Use the `svg-pie-chart` skill for SVG pie/donut chart changes.

Important rule: a single nonzero slice must render as a full `<circle>`, not an arc from 0 to 360 degrees. The center donut hole is drawn afterward.

Current chart modes:

- Total category breakdown
- Payer breakdown
- Jay category breakdown
- Ling category breakdown
- Jay&Ling category breakdown

## PWA / Vercel Notes

- `public/sw.js` should stay network-first so users do not get stale blank pages after deploys.
- Vercel auto-deploys on push to `main`.
- If production is blank, check:
  - Vercel env vars are present for Production
  - deployment was redeployed after env var edits
  - service worker cache has refreshed
  - generated JS bundle includes the expected Supabase project URL

## Useful Skills

- `react-vite-demo-debug`: Use for Vite/React blank-page and browser verification work.
- `svg-pie-chart`: Use for pie/donut chart rendering, especially single-slice 100% behavior.
- `skill-creator`: Use only when creating or updating reusable Codex skills.
