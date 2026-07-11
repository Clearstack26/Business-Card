-- Visitor identity for true return visits + Brisbane day buckets + session dedupe

alter table public.qr_scan_events
  add column if not exists visitor_id text;

create index if not exists qr_scan_events_visitor_id_idx
  on public.qr_scan_events (visitor_id);

-- Keep one scan row per browser tab session
delete from public.qr_scan_events a
using public.qr_scan_events b
where a.session_id is not null
  and a.session_id = b.session_id
  and a.ctid > b.ctid;

create unique index if not exists qr_scan_events_session_id_uidx
  on public.qr_scan_events (session_id)
  where session_id is not null;

-- Daily aggregates in Australia/Brisbane business days
create or replace view public.business_card_scans_by_day
with (security_invoker = true)
as
select
  ((scanned_at at time zone 'Australia/Brisbane')::date) as scan_date,
  count(*)::int as total_scans,
  count(distinct session_id)::int as unique_sessions,
  count(*) filter (where lower(coalesce(source, 'direct')) = 'qr')::int as qr_scans
from public.qr_scan_events
group by 1
order by 1 desc;

grant select on public.business_card_scans_by_day to authenticated;
