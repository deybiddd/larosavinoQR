-- Schema for events, tickets, and scan logs
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_name text not null,
  attendee_email text,
  status text not null default 'issued' check (status in ('issued','checked_in','revoked')),
  qr_secret text not null unique,
  created_at timestamptz not null default now(),
  checked_in_at timestamptz
);

create index if not exists tickets_event_idx on public.tickets(event_id);
create index if not exists tickets_qr_secret_idx on public.tickets(qr_secret);

create table if not exists public.scan_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  scanner_id text,
  result text not null check (result in ('success','duplicate','revoked','invalid'))
);

-- Basic RLS policies (adjust per your org)
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.scan_logs enable row level security;

-- Admin note: For production, restrict to service role / authenticated staff.
create policy "read_events_public" on public.events for select using (true);
create policy "read_tickets_service" on public.tickets for select using (auth.role() = 'service_role');
create policy "write_tickets_service" on public.tickets for all using (auth.role() = 'service_role') with check (true);
create policy "write_scans_service" on public.scan_logs for all using (auth.role() = 'service_role') with check (true);


