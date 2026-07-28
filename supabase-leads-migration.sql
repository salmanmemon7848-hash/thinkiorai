-- Thinkior Leads Finder v1
-- Run after supabase-schema.sql and supabase-founder-workspace-migration.sql.

create table if not exists public.founder_lead_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_type text not null check (lead_type in ('customer', 'investor')),
  query text not null,
  requested_count integer not null check (requested_count between 1 and 10),
  returned_count integer not null default 0 check (returned_count between 0 and 10),
  summary text,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.founder_leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid references public.founder_lead_searches(id) on delete set null,
  lead_type text not null check (lead_type in ('customer', 'investor')),
  name text not null,
  website text,
  location text,
  fit text not null,
  confidence text not null check (confidence in ('source_backed', 'ai_inferred')),
  contact_path text not null,
  contact_url text,
  evidence jsonb not null default '[]'::jsonb,
  stage text not null default 'saved' check (stage in ('saved', 'contacted', 'replied', 'not_a_fit')),
  notes text,
  follow_up_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_lead_outreach (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references public.founder_leads(id) on delete cascade,
  channel text not null check (channel in ('email', 'linkedin')),
  subject text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_founder_lead_searches_user_created on public.founder_lead_searches(user_id, created_at desc);
create index if not exists idx_founder_leads_user_stage on public.founder_leads(user_id, stage, created_at desc);
create index if not exists idx_founder_lead_outreach_lead on public.founder_lead_outreach(lead_id, created_at desc);

alter table public.founder_lead_searches enable row level security;
alter table public.founder_leads enable row level security;
alter table public.founder_lead_outreach enable row level security;

grant select, insert, update, delete on public.founder_lead_searches to authenticated;
grant select, insert, update, delete on public.founder_leads to authenticated;
grant select, insert, update, delete on public.founder_lead_outreach to authenticated;

drop policy if exists "lead_searches_owner" on public.founder_lead_searches;
create policy "lead_searches_owner" on public.founder_lead_searches for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "leads_owner" on public.founder_leads;
create policy "leads_owner" on public.founder_leads for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "lead_outreach_owner" on public.founder_lead_outreach;
create policy "lead_outreach_owner" on public.founder_lead_outreach for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop trigger if exists trg_founder_leads_updated on public.founder_leads;
create trigger trg_founder_leads_updated before update on public.founder_leads
  for each row execute function update_updated_at();
