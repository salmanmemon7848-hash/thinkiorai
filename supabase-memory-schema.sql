-- ═══════════════════════════════════════════════════════════════
-- THINKIOR AI — MEMORY + COMPLIANCE SCHEMA
-- Safe to re-run: all statements are idempotent
-- Run in Supabase SQL Editor after supabase-schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ── Founder profile (from onboarding wizard) ──────────────────
CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  founder_name          TEXT,
  idea_name             TEXT,
  idea_description      TEXT,
  domain                TEXT,
  target_customer       TEXT,
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.founder_profiles ADD COLUMN IF NOT EXISTS founder_name TEXT;

-- ── Session memory (every verdict/output saved) ────────────────
CREATE TABLE IF NOT EXISTS public.founder_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module        TEXT NOT NULL,
  session_title TEXT,
  verdict       TEXT,
  score         NUMERIC(4,1),
  summary       TEXT,
  full_output   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── DPDP Consent records ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_consents (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  functional      BOOLEAN NOT NULL DEFAULT TRUE,
  analytics       BOOLEAN NOT NULL DEFAULT FALSE,
  marketing       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address      TEXT,
  consented_at    TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at    TIMESTAMPTZ
);

-- ── Data deletion audit trail ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID,
  requested_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending'
);

-- ── RLS policies ─────────────────────────────────────────────
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_profiles_own" ON public.founder_profiles;
CREATE POLICY "founder_profiles_own" ON public.founder_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "founder_sessions_own" ON public.founder_sessions;
CREATE POLICY "founder_sessions_own" ON public.founder_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_consents_own" ON public.user_consents;
CREATE POLICY "user_consents_own" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "data_deletion_own" ON public.data_deletion_requests;
CREATE POLICY "data_deletion_own" ON public.data_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Auto-update updated_at trigger ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_founder_profiles_updated ON public.founder_profiles;
CREATE TRIGGER trg_founder_profiles_updated
  BEFORE UPDATE ON public.founder_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_founder_sessions_user ON public.founder_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_sessions_module ON public.founder_sessions(user_id, module);
CREATE INDEX IF NOT EXISTS idx_founder_sessions_created ON public.founder_sessions(created_at DESC);
