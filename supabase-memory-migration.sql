-- ================================================================
-- THINKIOR — Founder memory upgrade (Phase 6)
-- Adds structured-card data to founder_sessions so Co-founder
-- Desk can reference past Validator/Pitch/Ideas results.
-- ================================================================

alter table public.founder_sessions
  add column if not exists card_data jsonb,
  add column if not exists card_kind text,
  add column if not exists score_100 integer;

create index if not exists idx_founder_sessions_card_kind
  on public.founder_sessions(user_id, card_kind, created_at desc)
  where card_kind is not null;
