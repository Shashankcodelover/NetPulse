-- ═══════════════════════════════════════════════════════
-- NetPulse — Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor to create all tables.
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Contacts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  previous_company TEXT,
  previous_title TEXT,
  source TEXT NOT NULL DEFAULT 'linkedin' CHECK (source IN ('linkedin', 'whatsapp', 'manual')),
  relationship_tier TEXT NOT NULL DEFAULT 'warm' CHECK (relationship_tier IN ('priority', 'warm', 'cold')),
  last_contacted_at TIMESTAMPTZ,
  last_bulk_synced_at TIMESTAMPTZ,
  last_enriched_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_tier ON contacts(user_id, relationship_tier);
CREATE INDEX idx_contacts_last_contacted ON contacts(user_id, last_contacted_at);
CREATE INDEX idx_contacts_name ON contacts(user_id, full_name);

-- ─── Interactions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('message', 'comment', 'call', 'note')),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);

-- ─── Priority Scores ──────────────────────────────────
CREATE TABLE IF NOT EXISTS priority_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  recency_score INTEGER NOT NULL DEFAULT 0,
  tier_score INTEGER NOT NULL DEFAULT 0,
  title_score INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contact_id)
);

CREATE INDEX idx_priority_scores_user_score ON priority_scores(user_id, score DESC);

-- ─── Drafts (Reply Drafting Tool) ─────────────────────
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  summary TEXT,
  draft_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drafts_user_id ON drafts(user_id);

-- ─── User Settings ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scoring_weights JSONB NOT NULL DEFAULT '{"recency_weight": 35, "tier_weight": 25, "title_weight": 20, "engagement_weight": 20}'::jsonb,
  digest_count INTEGER NOT NULL DEFAULT 12,
  digest_email_time TEXT NOT NULL DEFAULT '08:00',
  digest_email_enabled BOOLEAN NOT NULL DEFAULT false,
  cadence_priority_days INTEGER NOT NULL DEFAULT 3,
  cadence_warm_days INTEGER NOT NULL DEFAULT 30,
  cadence_cold_days INTEGER NOT NULL DEFAULT 90,
  target_companies JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_titles JSONB NOT NULL DEFAULT '["Founder", "CEO", "CTO", "VP", "Director", "Head of", "Partner"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ═══════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- Users can only access their own data.
-- ═══════════════════════════════════════════════════════

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Contacts: Users can CRUD their own contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Interactions: Users can CRUD their own interactions
CREATE POLICY "Users can view own interactions"
  ON interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Priority Scores: Users can CRUD their own scores
CREATE POLICY "Users can view own scores"
  ON priority_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON priority_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON priority_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Drafts: Users can CRUD their own drafts
CREATE POLICY "Users can view own drafts"
  ON drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON drafts FOR DELETE
  USING (auth.uid() = user_id);

-- User Settings: Users can CRUD their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
