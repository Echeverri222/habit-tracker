# Habit Tower

A pixel-art habit tracker. Every habit is a floor in a night-city tower: tap a
window to light up that day, keep the streak board green, and watch the
basement archive fill up.

- **Next.js 16** (App Router, Server Actions) on **Vercel**
- **Supabase Postgres**: `habits` + `habit_logs`, accessed server-side only (RLS on, no public policies)
- Single-user passcode gate (`APP_PASSCODE`)

## Local

```bash
npm install
cp .env.example .env.local   # fill in, or leave Supabase empty
npm run dev
```

With no Supabase env vars, data is stored in `.data/db.json` (gitignored).

## Env

| Var | Purpose |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Secret (service role) key, server only |
| `APP_PASSCODE` | Passcode for the security desk (required in production) |

## Database

Schema lives in `supabase/migrations`. Apply with `supabase db push` after `supabase link`.
