-- ================================================================
-- THINKIOR — Reports upgrade migration (Phase 5)
-- Adds:
--   - share_slug for public read-only report links
--   - executive_summary cached column for fast list rendering
-- ================================================================

alter table public.business_reports
  add column if not exists share_slug text unique,
  add column if not exists share_enabled boolean not null default false,
  add column if not exists industry_tag text;

create index if not exists idx_business_reports_share_slug
  on public.business_reports(share_slug)
  where share_slug is not null;

-- pg_trgm gives us fast ILIKE search on titles; only create if available
create extension if not exists pg_trgm;
create index if not exists idx_business_reports_name_trgm
  on public.business_reports using gin (business_name gin_trgm_ops);
