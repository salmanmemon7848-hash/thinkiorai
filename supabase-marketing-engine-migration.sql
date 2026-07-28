-- Thinkior Marketing Engine v1
-- Run after supabase-schema.sql, supabase-memory-schema.sql, and
-- supabase-founder-workspace-migration.sql.

-- The removed Competitor Intel feature is intentionally purged.
delete from public.founder_sessions where module = 'competitor';
delete from public.daily_usage where feature = 'competitor';
delete from public.activity_log where feature = 'competitor';
delete from public.saved_reports where feature = 'competitor';

create table if not exists public.founder_marketing_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  offer text not null,
  audience text not null,
  country text not null,
  goal text not null,
  capacity text not null,
  stage text not null,
  current_channels text,
  platforms jsonb not null default '[]'::jsonb,
  strategy jsonb not null default '{}'::jsonb,
  starter_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_marketing_roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  revision integer not null default 1 check (revision between 1 and 2),
  objective text not null,
  strategy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start, revision)
);

create table if not exists public.founder_marketing_content_packs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid references public.founder_marketing_roadmaps(id) on delete set null,
  platform text not null check (platform in ('instagram', 'facebook', 'youtube', 'linkedin')),
  content_type text not null,
  title text not null,
  objective text not null,
  scheduled_for timestamptz,
  status text not null default 'planned' check (status in ('planned', 'created', 'published', 'learned')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_marketing_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid references public.founder_marketing_roadmaps(id) on delete set null,
  views integer not null default 0 check (views >= 0),
  engagement integer not null default 0 check (engagement >= 0),
  leads integer not null default 0 check (leads >= 0),
  sales integer not null default 0 check (sales >= 0),
  notes text,
  next_priority text,
  created_at timestamptz not null default now()
);

-- A row reserves one capacity slot. The unique key makes concurrent requests
-- fail safely before an AI generation can create over-quota content.
create table if not exists public.founder_marketing_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('starter', 'roadmap', 'content')),
  period_start date not null,
  slot integer not null check (slot between 1 and 10),
  created_at timestamptz not null default now(),
  unique(user_id, kind, period_start, slot)
);

create index if not exists idx_marketing_roadmaps_user_week on public.founder_marketing_roadmaps(user_id, week_start desc);
create index if not exists idx_marketing_packs_user_created on public.founder_marketing_content_packs(user_id, created_at desc);
create index if not exists idx_marketing_reviews_user_created on public.founder_marketing_reviews(user_id, created_at desc);
create index if not exists idx_marketing_usage_user_period on public.founder_marketing_usage(user_id, kind, period_start);

alter table public.founder_marketing_profiles enable row level security;
alter table public.founder_marketing_roadmaps enable row level security;
alter table public.founder_marketing_content_packs enable row level security;
alter table public.founder_marketing_reviews enable row level security;
alter table public.founder_marketing_usage enable row level security;

grant select, insert, update, delete on public.founder_marketing_profiles to authenticated;
grant select, insert, update, delete on public.founder_marketing_roadmaps to authenticated;
grant select, insert, update, delete on public.founder_marketing_content_packs to authenticated;
grant select, insert, update, delete on public.founder_marketing_reviews to authenticated;
grant select, insert, delete on public.founder_marketing_usage to authenticated;

drop policy if exists "marketing_profile_owner" on public.founder_marketing_profiles;
create policy "marketing_profile_owner" on public.founder_marketing_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "marketing_roadmap_owner" on public.founder_marketing_roadmaps;
create policy "marketing_roadmap_owner" on public.founder_marketing_roadmaps for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "marketing_pack_owner" on public.founder_marketing_content_packs;
create policy "marketing_pack_owner" on public.founder_marketing_content_packs for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "marketing_review_owner" on public.founder_marketing_reviews;
create policy "marketing_review_owner" on public.founder_marketing_reviews for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "marketing_usage_owner" on public.founder_marketing_usage;
create policy "marketing_usage_owner" on public.founder_marketing_usage for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.update_marketing_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_marketing_profiles_updated on public.founder_marketing_profiles;
create trigger trg_marketing_profiles_updated before update on public.founder_marketing_profiles
  for each row execute function public.update_marketing_updated_at();
drop trigger if exists trg_marketing_roadmaps_updated on public.founder_marketing_roadmaps;
create trigger trg_marketing_roadmaps_updated before update on public.founder_marketing_roadmaps
  for each row execute function public.update_marketing_updated_at();
drop trigger if exists trg_marketing_packs_updated on public.founder_marketing_content_packs;
create trigger trg_marketing_packs_updated before update on public.founder_marketing_content_packs
  for each row execute function public.update_marketing_updated_at();
