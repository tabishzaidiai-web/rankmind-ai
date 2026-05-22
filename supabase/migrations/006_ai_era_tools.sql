-- Migration: AI-Era Tools Tables
-- Created: 2026-05-22
-- Tables: ai_citations, schema_results, freshness_results

-- ─────────────────────────────────────────────────────────────────────────────
-- AI Citation Tracker results
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  overall_citation_score INTEGER NOT NULL DEFAULT 0,
  google_ai_mode_score INTEGER,
  chatgpt_score INTEGER,
  perplexity_score INTEGER,
  gemini_score INTEGER,
  eeat_score INTEGER,
  semantic_completeness_score NUMERIC(4,1),
  entity_density_score INTEGER,
  citation_readiness_summary TEXT,
  top_cited_queries JSONB DEFAULT '[]',
  citation_gaps JSONB DEFAULT '[]',
  improvement_actions JSONB DEFAULT '[]',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_citations_user_id_idx ON ai_citations(user_id);
CREATE INDEX IF NOT EXISTS ai_citations_website_id_idx ON ai_citations(website_id);
CREATE INDEX IF NOT EXISTS ai_citations_created_at_idx ON ai_citations(created_at DESC);

ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ai_citations"
  ON ai_citations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Schema Generator results
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  page_type TEXT,
  schemas_generated JSONB DEFAULT '[]',
  implementation_guide TEXT,
  estimated_rich_result_types TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS schema_results_user_id_idx ON schema_results(user_id);

ALTER TABLE schema_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own schema_results"
  ON schema_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Content Freshness Monitor results
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS freshness_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  overall_freshness_score INTEGER NOT NULL DEFAULT 0,
  days_since_last_update INTEGER,
  freshness_status TEXT, -- 'fresh' | 'aging' | 'stale' | 'critical'
  pages_analyzed JSONB DEFAULT '[]',
  urgent_refreshes JSONB DEFAULT '[]',
  refresh_plan JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS freshness_results_user_id_idx ON freshness_results(user_id);

ALTER TABLE freshness_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own freshness_results"
  ON freshness_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Add ai_citation_readiness_score column to geo_scores if not exists
-- (used by dashboard KPI card)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE geo_scores
  ADD COLUMN IF NOT EXISTS ai_citation_readiness_score INTEGER,
  ADD COLUMN IF NOT EXISTS google_ai_mode_score INTEGER,
  ADD COLUMN IF NOT EXISTS semantic_completeness_score NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS entity_density_score INTEGER,
  ADD COLUMN IF NOT EXISTS eeat_score INTEGER;
