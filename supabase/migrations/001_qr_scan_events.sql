-- Business card QR scan analytics (ClearStack Supabase project)
-- Run in Supabase SQL editor or via CLI against project siaktnkaavgefjxgprrf

create table if not exists public.qr_scan_events (
  id uuid primary key default gen_random_uuid(),
  scanned_at timestamptz not null default now(),
  scan_date date not null default (timezone('utc', now()))::date,
  source text not null default 'direct',
  session_id text,
  device_type text,
  country text,
  city text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists qr_scan_events_scanned_at_idx
  on public.qr_scan_events (scanned_at desc);

create index if not exists qr_scan_events_scan_date_idx
  on public.qr_scan_events (scan_date desc);

alter table public.qr_scan_events enable row level security;

-- Inserts happen via service role in /api/track-scan only (bypasses RLS).
-- Authenticated ClearStack portal users can read scan data.
drop policy if exists "qr_scan_events_select_authenticated" on public.qr_scan_events;
create policy "qr_scan_events_select_authenticated"
  on public.qr_scan_events
  for select
  to authenticated
  using (true);

-- Daily aggregation view for trend charts
create or replace view public.business_card_scans_by_day
with (security_invoker = true)
as
select
  scan_date,
  count(*)::int as total_scans,
  count(distinct session_id)::int as unique_sessions
from public.qr_scan_events
group by scan_date
order by scan_date desc;

grant select on public.business_card_scans_by_day to authenticated;

-- Enable live dashboard updates (Supabase Realtime)
alter publication supabase_realtime add table public.qr_scan_events;
