# Bocce League Scoring App

Mobile-first bocce league scoring app with verified submissions, commissioner corrections, and weekly email/Drive exports.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` using `.env.example`.
3. Apply the Supabase migration in `supabase/migrations/0001_init.sql`.
4. Apply `supabase/migrations/0002_team_dropdown_login.sql` if your DB already has the older team-code schema.
5. Load the 2026 schedule and teams:

```sql
-- Run in Supabase SQL editor
\i supabase/seeds/2026_schedule.sql
```

If your SQL editor does not support `\i`, paste the contents of `supabase/seeds/2026_schedule.sql` directly.
All team codes are currently `1234`.
All seeded match times are `6:30 PM`.
6. Run the app:

```bash
npm run dev
```

## Supabase

- Use the SQL migration to create tables and enums.
- Provide `SUPABASE_SERVICE_ROLE_KEY` for server routes.

## Scheduled jobs

Set Supabase cron to call:
- `POST /api/email/send` every Thursday at 11:00 (season timezone)
- `POST /api/backups/drive` weekly (pass `weekNumber` in body)

## Auth

- Captains: select team + team code
- Commissioner: commissioner code stored on season
- Bootstrap: set `BOOTSTRAP_KEY` and pass `x-bootstrap-key` header to create the first season

## Deploy to bellavillabocce.com

1. Deploy this app to Vercel:

```bash
npm i -g vercel
cd /Users/nina/VSCode/Bocce
vercel --prod
```

2. In Vercel project settings, add domain `bellavillabocce.com`.
3. At your domain registrar, set:
- `A` record for `@` to `76.76.21.21`
- `CNAME` record for `www` to `cname.vercel-dns.com`
4. Add all production env vars in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_SECRET`).
