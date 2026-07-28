-- Thinkior Founder Workspace v1
-- Run after supabase-schema.sql and supabase-memory-schema.sql.

alter table public.founder_profiles
  add column if not exists operating_country text,
  add column if not exists operating_market text,
  add column if not exists founder_stage text default 'pre_idea';

create table if not exists public.founder_evidence (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  claim text not null,
  kind text not null default 'market',
  source_url text,
  source_title text,
  source_date date,
  confidence text not null default 'medium',
  status text not null default 'unverified',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.founder_decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  rationale text,
  expected_outcome text,
  status text not null default 'open',
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.founder_experiments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  hypothesis text,
  success_metric text,
  resource_url text,
  resource_title text,
  due_date date,
  status text not null default 'planned',
  outcome text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.founder_gtm_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  icp text,
  positioning text,
  value_proposition text,
  first_channel text,
  next_action text,
  resource_url text,
  resource_title text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.founder_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  learned text,
  changed_assumption text,
  next_focus text,
  created_at timestamptz default now()
);

alter table public.founder_evidence enable row level security;
alter table public.founder_decisions enable row level security;
alter table public.founder_experiments enable row level security;
alter table public.founder_gtm_plans enable row level security;
alter table public.founder_reviews enable row level security;

drop policy if exists "founder_evidence_own" on public.founder_evidence;
create policy "founder_evidence_own" on public.founder_evidence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "founder_decisions_own" on public.founder_decisions;
create policy "founder_decisions_own" on public.founder_decisions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "founder_experiments_own" on public.founder_experiments;
create policy "founder_experiments_own" on public.founder_experiments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "founder_gtm_plans_own" on public.founder_gtm_plans;
create policy "founder_gtm_plans_own" on public.founder_gtm_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "founder_reviews_own" on public.founder_reviews;
create policy "founder_reviews_own" on public.founder_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_founder_evidence_user_created on public.founder_evidence(user_id, created_at desc);
create index if not exists idx_founder_experiments_user_due on public.founder_experiments(user_id, due_date);
create index if not exists idx_founder_decisions_user_created on public.founder_decisions(user_id, created_at desc);

-- A payment callback can be retried. One payment must grant access only once.
create unique index if not exists subscriptions_payment_id_unique
  on public.subscriptions(razorpay_payment_id)
  where razorpay_payment_id is not null;
