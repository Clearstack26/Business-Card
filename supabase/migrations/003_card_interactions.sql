-- Link click / interaction tracking for business card sessions

create table if not exists public.card_interactions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_type text not null default 'link_click',
  link_id text not null,
  link_label text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists card_interactions_session_id_idx
  on public.card_interactions (session_id);

create index if not exists card_interactions_occurred_at_idx
  on public.card_interactions (occurred_at desc);

alter table public.card_interactions enable row level security;

drop policy if exists "card_interactions_select_authenticated" on public.card_interactions;
create policy "card_interactions_select_authenticated"
  on public.card_interactions
  for select
  to authenticated
  using (true);

alter publication supabase_realtime add table public.card_interactions;
