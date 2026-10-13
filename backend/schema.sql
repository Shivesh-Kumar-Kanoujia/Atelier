-- Atelier Database Schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to run multiple times (idempotent)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('creator', 'brand')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- ─── Creator Profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  handle          TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  discipline      TEXT NOT NULL,
  location        TEXT,
  bio             TEXT,
  tools           TEXT[]  DEFAULT '{}',
  skills          TEXT[]  DEFAULT '{}',
  styles          TEXT[]  DEFAULT '{}',
  formats         TEXT[]  DEFAULT '{}',
  availability    TEXT NOT NULL DEFAULT 'Available Now',
  starting_rate   INTEGER,
  rate_tier       TEXT,
  response_time   TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  socials         JSONB   DEFAULT '{}',
  stats           JSONB   DEFAULT '{"completedProjects": 0, "rating": 0, "reviewsCount": 0}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_discipline ON creator_profiles(discipline);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_availability ON creator_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_starting_rate ON creator_profiles(starting_rate);

-- ─── Brand Profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  org_name    TEXT NOT NULL,
  industry    TEXT,
  website     TEXT,
  bio         TEXT,
  location    TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- ─── Portfolio Items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  type            TEXT,
  category        TEXT,
  aspect_ratio    TEXT,
  duration        TEXT,
  badge           TEXT,
  client_badge    TEXT,
  tools           TEXT[]  DEFAULT '{}',
  workflow        TEXT,
  output          TEXT,
  media_url       TEXT,
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_creator ON portfolio_items(creator_id);

-- ─── Campaigns ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id              UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,
  title                 TEXT NOT NULL,
  client                TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published','reviewing','in_production','completed','closed')),
  status_label          TEXT,
  objective             TEXT NOT NULL,
  content_type          TEXT NOT NULL,
  description           TEXT NOT NULL,
  budget_tier           TEXT,
  budget_amount         INTEGER,
  deadline              DATE,
  commercial_rights     TEXT,
  commercial_rights_summary TEXT,
  styles                TEXT[]  DEFAULT '{}',
  aspect_ratios         TEXT[]  DEFAULT '{}',
  deliverables          TEXT[]  DEFAULT '{}',
  required_tools        TEXT[]  DEFAULT '{}',
  reference_links       TEXT[]  DEFAULT '{}',
  audio_notes           TEXT,
  proposals_count       INTEGER DEFAULT 0,
  assigned_creator_id   UUID REFERENCES creator_profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ─── Shortlists ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shortlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  creator_id  UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, creator_id)
);

-- ─── Invitations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id    UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  brand_id      UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ,
  UNIQUE (campaign_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_creator ON invitations(creator_id);
CREATE INDEX IF NOT EXISTS idx_invitations_campaign ON invitations(campaign_id);

-- ─── Engagements ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id    UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  brand_id      UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ,
  UNIQUE (campaign_id, creator_id)
);

-- ─── Updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_creator_profiles_updated ON creator_profiles;
CREATE TRIGGER trg_creator_profiles_updated BEFORE UPDATE ON creator_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_brand_profiles_updated ON brand_profiles;
CREATE TRIGGER trg_brand_profiles_updated BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_campaigns_updated ON campaigns;
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_invitations_updated ON invitations;
CREATE TRIGGER trg_invitations_updated BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_engagements_updated ON engagements;
CREATE TRIGGER trg_engagements_updated BEFORE UPDATE ON engagements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- Users: own row only
DROP POLICY IF EXISTS "users_own" ON users;
CREATE POLICY "users_own" ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Creator profiles: public read, own write
DROP POLICY IF EXISTS "creator_profiles_public_read" ON creator_profiles;
CREATE POLICY "creator_profiles_public_read" ON creator_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "creator_profiles_own_write" ON creator_profiles;
CREATE POLICY "creator_profiles_own_write" ON creator_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Brand profiles: public read, own write
DROP POLICY IF EXISTS "brand_profiles_public_read" ON brand_profiles;
CREATE POLICY "brand_profiles_public_read" ON brand_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "brand_profiles_own_write" ON brand_profiles;
CREATE POLICY "brand_profiles_own_write" ON brand_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Portfolio: public read, creator own write
DROP POLICY IF EXISTS "portfolio_public_read" ON portfolio_items;
CREATE POLICY "portfolio_public_read" ON portfolio_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "portfolio_own_write" ON portfolio_items;
CREATE POLICY "portfolio_own_write" ON portfolio_items
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  );

-- Campaigns: published/reviewing/in_production public, draft owner only
DROP POLICY IF EXISTS "campaigns_public_read" ON campaigns;
CREATE POLICY "campaigns_public_read" ON campaigns
  FOR SELECT
  USING (
    status IN ('published', 'reviewing', 'in_production', 'completed') OR
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id)
  );

DROP POLICY IF EXISTS "campaigns_brand_write" ON campaigns;
CREATE POLICY "campaigns_brand_write" ON campaigns
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id)
  );

-- Shortlists: brand own
DROP POLICY IF EXISTS "shortlists_brand_own" ON shortlists;
CREATE POLICY "shortlists_brand_own" ON shortlists
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id)
  );

-- Invitations: brand own or creator own
DROP POLICY IF EXISTS "invitations_access" ON invitations;
CREATE POLICY "invitations_access" ON invitations
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id) OR
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id) OR
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  );

-- Engagements: brand own or creator own
DROP POLICY IF EXISTS "engagements_access" ON engagements;
CREATE POLICY "engagements_access" ON engagements
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id) OR
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM brand_profiles WHERE id = brand_id) OR
    auth.uid() = (SELECT user_id FROM creator_profiles WHERE id = creator_id)
  );

-- ─── Storage Bucket ──────────────────────────────────────────────────────────
-- Automatically configure 'creator-media' bucket if storage schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('creator-media', 'creator-media', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
