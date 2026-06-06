-- ================================================================
-- THINKIOR AI — Complete Supabase Schema
-- Safe to re-run: all statements are idempotent
-- ================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text,
  name          text,
  avatar_url    text,
  plan          text not null default 'free' check (plan in ('free', 'builder', 'founder_pro')),
  plan_expires_at timestamp with time zone,
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 2. DAILY USAGE TABLE
create table if not exists public.daily_usage (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  feature     text not null,
  date        date not null default current_date,
  count       integer not null default 0,
  unique(user_id, feature, date)
);

alter table public.daily_usage enable row level security;

drop policy if exists "Users can manage own usage" on public.daily_usage;
create policy "Users can manage own usage"
  on public.daily_usage for all using (auth.uid() = user_id);

-- 3. ACTIVITY LOG TABLE
create table if not exists public.activity_log (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade,
  feature       text not null,
  title         text,
  summary       text,
  metadata      jsonb default '{}',
  created_at    timestamp with time zone default now()
);

alter table public.activity_log enable row level security;

drop policy if exists "Users can manage own activity" on public.activity_log;
create policy "Users can manage own activity"
  on public.activity_log for all using (auth.uid() = user_id);

-- 4. SAVED REPORTS TABLE
create table if not exists public.saved_reports (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade,
  feature       text not null,
  title         text not null,
  content       text not null,
  metadata      jsonb default '{}',
  created_at    timestamp with time zone default now()
);

alter table public.saved_reports enable row level security;

drop policy if exists "Users can manage own reports" on public.saved_reports;
create policy "Users can manage own reports"
  on public.saved_reports for all using (auth.uid() = user_id);

-- 4b. BUSINESS REPORTS TABLE (investor-grade structured reports)
create table if not exists public.business_reports (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  business_name text,
  report_type   text not null,
  industry      text not null,
  stage         text,
  input_data    jsonb not null default '{}',
  report_data   jsonb not null,
  created_at    timestamp with time zone default now()
);

alter table public.business_reports enable row level security;

drop policy if exists "Users can manage own business reports" on public.business_reports;
create policy "Users can manage own business reports"
  on public.business_reports for all using (auth.uid() = user_id);

create index if not exists idx_business_reports_user on public.business_reports(user_id);
create index if not exists idx_business_reports_created on public.business_reports(created_at desc);

-- 5. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade,
  razorpay_order_id   text,
  razorpay_payment_id text,
  razorpay_signature  text,
  plan                text not null,
  amount              integer not null,
  currency            text not null default 'INR',
  status              text not null default 'pending',
  created_at          timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own subscriptions" on public.subscriptions;
create policy "Users can insert own subscriptions"
  on public.subscriptions for insert with check (auth.uid() = user_id);

-- 6. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
