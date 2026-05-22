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
