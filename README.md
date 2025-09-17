# La Rosa Vino — Events & QR

A Next.js app for creating events, issuing QR tickets, and scanning check-ins, aligned to La Rosa Vino branding.

## Tech
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (DB + RLS)
- React Query, Sonner, qrcode.react, jsQR, react-webcam

## Getting Started
1. Install deps:
```bash
npm install
```
2. Env variables (create `.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
```
3. Apply database schema to Supabase:
- Run the SQL in `supabase.sql` in the Supabase SQL editor.
- Review RLS and restrict writes to service role for production.

4. Dev server:
```bash
npm run dev
```
Open `http://localhost:3000`.

## Routes
- `/` — Landing
- `/admin` — Events list + create
- `/admin/tickets` — Issue tickets and view QR codes
- `/scanner` — Camera-based QR scanner
- API: `/api/events`, `/api/tickets`, `/api/verify`

## Branding
- Tokens in `src/app/globals.css` using CSS variables (wine red, warm gold, muted neutrals).
- Adjust `--brand-*` variables to match updated brand guidelines from `larosavino.com`.

## Notes
- QR encodes an opaque `qr_secret` only. Scanner verifies and marks attendance.
- For production, lock down RLS to authenticated staff or service role.
- Consider email delivery of tickets with embedded QR in future.
