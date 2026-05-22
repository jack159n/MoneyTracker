# Deploy Our Ledger

This app is designed to run as:

```text
iPhone Safari / PWA -> Vercel frontend -> Supabase Auth + Postgres
```

## 1. Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Authentication > Providers and keep Email enabled.
5. In Authentication > URL Configuration, add these redirect URLs:

```text
http://localhost:5175
https://YOUR_VERCEL_DOMAIN
```

6. Copy these values from Project Settings > API:

```text
Project URL
anon public key
```

## 2. Local Test

Create `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Fill it:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Start the app:

```powershell
.\start-dev.cmd
```

Open:

```text
http://127.0.0.1:5175
```

Sign in once with both emails. Each account will initially see a locked screen with its user id.

## 3. Allow Only Both Of You

In Supabase SQL Editor, use `supabase/seed-members.example.sql`.

Replace:

```text
PASTE_COUPLE_ID
PASTE_YOUR_AUTH_USER_ID
PASTE_GIRLFRIEND_AUTH_USER_ID
```

After that, only those two users can read or write ledger data. Other signed-in users stay locked out by Row Level Security.

## 4. Vercel

1. Import `jack159n/MoneyTracker` in Vercel.
2. Set framework preset to Vite if needed.
3. Add environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Deploy.
5. Copy the Vercel domain.
6. Add that domain to Supabase Authentication redirect URLs.

## 5. iPhone

Open the Vercel URL in Safari, then Share > Add to Home Screen.
