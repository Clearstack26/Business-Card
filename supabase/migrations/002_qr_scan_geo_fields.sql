-- Richer geo fields for travel-accurate scan locations
alter table public.qr_scan_events
  add column if not exists region text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists scanner_timezone text;

create index if not exists qr_scan_events_country_city_idx
  on public.qr_scan_events (country, city);
