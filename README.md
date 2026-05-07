# BabyChess

BabyChess is a Next.js + Supabase app for storing chess games as PGN, searching them by player, date, and who added them, and opening each game in detail.

## What is included

- Searchable chess database UI
- PGN insert form with Supabase auth tracking
- Game detail view
- SQL schema with RLS policies
- Vercel-friendly environment variable setup

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Add these environment variables in Vercel and locally:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Enable email auth in Supabase if you want login links.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push the repo to GitHub and import it into Vercel. Add the Supabase environment variables in the Vercel project settings.

## Notes

- Public reads are enabled in the schema so the list and detail pages can work for everyone.
- Inserts require an authenticated Supabase user so the app can record who added each game.
