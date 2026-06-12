-- ================================================================
-- THINKIOR AI — Plan-gating migration (2026-06-12)
-- Run this in Supabase → SQL Editor.
-- Safe to re-run: all statements are idempotent.
--
-- What this does:
--   1. Resets any stuck daily_usage counters for locked features
--      (report / competitor) for users who no longer have access.
--      This prevents confusion where a free user's report count
--      says "1 / 0" in the UI.
--   2. Adds an index on (user_id, feature, date) for faster lookups
--      (the existing unique constraint already creates an index,
--      but being explicit keeps query plans stable).
--   3. Logs an audit row so you can confirm the migration ran.
-- ================================================================

-- 1. Zero out report counters for non-Founder-Pro users
update public.daily_usage du
set count = 0
from public.profiles p
where du.user_id = p.id
  and du.feature = 'report'
  and du.count > 0
  and coalesce(p.plan, 'free') <> 'founder_pro';

-- 2. Zero out competitor counters for free users
update public.daily_usage du
set count = 0
from public.profiles p
where du.user_id = p.id
  and du.feature = 'competitor'
  and du.count > 0
  and coalesce(p.plan, 'free') = 'free';

-- 3. Defensive index (the unique(user_id, feature, date) constraint
--    already creates one, but this makes the intent obvious and keeps
--    query plans stable if the constraint is ever dropped)
create index if not exists idx_daily_usage_user_feature_date
  on public.daily_usage(user_id, feature, date);

-- 4. Audit trail row
create table if not exists public.migration_log (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  applied_at  timestamp with time zone default now(),
  notes       text
);

alter table public.migration_log enable row level security;

drop policy if exists "No public access to migration_log" on public.migration_log;
create policy "No public access to migration_log"
  on public.migration_log for all using (false);

insert into public.migration_log (name, notes)
values (
  'plan_gating_reports_and_competitor',
  'Business Reports → Founder Pro only (3/day). Competitor Research → Builder & above. Free users can no longer use either feature. Run on 2026-06-12.'
)
on conflict do nothing;
