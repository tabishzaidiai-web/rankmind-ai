-- RankMind AI v2.0 — Full Schema Migration
-- Run this in Supabase SQL Editor after existing migrations

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS (extend existing) ──────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free','starter','growth','agency','enterprise')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agency_name TEXT,
  ADD COLUMN IF NOT EXISTS agency_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS agency_brand_color TEXT DEFAULT '#6C47FF',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── WEBSITES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  name TEXT,
  business_description TEXT,
  niche TEXT,
  country TEXT,
  target_countries TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  is_local BOOLEAN DEFAULT FALSE,
  city TEXT,
  seo_goal TEXT,
  seo_self_rating INTEGER DEFAULT 5,
  -- CMS integrations (stored per website)
  wordpress_url TEXT,
  wordpress_app_password TEXT,
  webflow_api_key TEXT,
  shopify_api_key TEXT,
  -- GSC / GA
  gsc_connected BOOLEAN DEFAULT FALSE,
  ga_connected BOOLEAN DEFAULT FALSE,
  -- Scores (updated by agents)
  seo_score INTEGER DEFAULT 0,
  geo_score INTEGER DEFAULT 0,
  last_audit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own websites" ON public.websites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access websites" ON public.websites FOR ALL USING (auth.role() = 'service_role');

-- ─── KEYWORDS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'secondary' CHECK (type IN ('primary','secondary','supporting','longtail','trust')),
  search_volume INTEGER DEFAULT 0,
  difficulty INTEGER DEFAULT 0,
  cpc NUMERIC(10,2) DEFAULT 0,
  search_intent TEXT DEFAULT 'informational',
  ranking_position INTEGER,
  target_country TEXT DEFAULT 'US',
  serp_features TEXT[] DEFAULT '{}',
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own keywords" ON public.keywords FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.websites WHERE id = website_id)
);
CREATE POLICY "Service role full access keywords" ON public.keywords FOR ALL USING (auth.role() = 'service_role');

-- ─── CONTENT QUEUE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  meta_title TEXT,
  meta_description TEXT,
  target_keyword TEXT,
  word_count INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'blog_post',
  schema_markup TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','published','rejected')),
  cms_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content" ON public.content_queue FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.websites WHERE id = website_id)
);
CREATE POLICY "Service role full access content" ON public.content_queue FOR ALL USING (auth.role() = 'service_role');

-- ─── BACKLINK OPPORTUNITIES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backlink_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  target_site_url TEXT NOT NULL,
  target_site_domain TEXT NOT NULL,
  target_site_da INTEGER DEFAULT 0,
  target_site_spam_score NUMERIC(5,2) DEFAULT 0,
  is_dofollow BOOLEAN DEFAULT TRUE,
  site_type TEXT DEFAULT 'guest_post' CHECK (site_type IN ('guest_post','directory','forum','qa','citation','profile','web20','other')),
  keyword_id UUID REFERENCES public.keywords(id),
  keyword_text TEXT,
  anchor_text TEXT,
  content_draft TEXT,
  outreach_email_subject TEXT,
  outreach_email_body TEXT,
  scheduled_date DATE,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','approved','submitted','published','rejected','lost')),
  live_url TEXT,
  date_submitted DATE,
  date_published DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own backlinks" ON public.backlink_opportunities FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.websites WHERE id = website_id)
);
CREATE POLICY "Service role full access backlinks" ON public.backlink_opportunities FOR ALL USING (auth.role() = 'service_role');

-- ─── AUDITS (extend existing) ─────────────────────────────────────────────────
ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS website_id UUID REFERENCES public.websites(id),
  ADD COLUMN IF NOT EXISTS technical_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onpage_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS authority_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS issues_json JSONB DEFAULT '[]'::jsonb;

-- ─── GEO SCORES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.geo_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  visibility_score INTEGER DEFAULT 0,
  queries_checked INTEGER DEFAULT 0,
  citations_found INTEGER DEFAULT 0,
  chatgpt_score INTEGER DEFAULT 0,
  perplexity_score INTEGER DEFAULT 0,
  gemini_score INTEGER DEFAULT 0,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.geo_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own geo scores" ON public.geo_scores FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.websites WHERE id = website_id)
);
CREATE POLICY "Service role full access geo" ON public.geo_scores FOR ALL USING (auth.role() = 'service_role');

-- ─── REPORTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('weekly','monthly')),
  period_start DATE,
  period_end DATE,
  pdf_url TEXT,
  email_sent_at TIMESTAMPTZ,
  data_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reports" ON public.reports FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.websites WHERE id = website_id)
);
CREATE POLICY "Service role full access reports" ON public.reports FOR ALL USING (auth.role() = 'service_role');

-- ─── AGENCY CLIENTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agency_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.users(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_website_id UUID REFERENCES public.websites(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency users manage own clients" ON public.agency_clients FOR ALL USING (auth.uid() = agency_user_id);
CREATE POLICY "Service role full access agency" ON public.agency_clients FOR ALL USING (auth.role() = 'service_role');

-- ─── AGENT ACTIVITY LOG ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own activity" ON public.agent_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access activity" ON public.agent_activity FOR ALL USING (auth.role() = 'service_role');
GRANT INSERT ON public.agent_activity TO authenticated;

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS websites_user_id_idx ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS keywords_website_id_idx ON public.keywords(website_id);
CREATE INDEX IF NOT EXISTS content_queue_website_id_status_idx ON public.content_queue(website_id, status);
CREATE INDEX IF NOT EXISTS backlinks_website_id_status_idx ON public.backlink_opportunities(website_id, status);
CREATE INDEX IF NOT EXISTS geo_scores_website_id_idx ON public.geo_scores(website_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_activity_user_id_idx ON public.agent_activity(user_id, created_at DESC);

-- ─── GRANTS ───────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.websites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keywords TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backlink_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geo_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agency_clients TO authenticated;
GRANT SELECT ON public.agent_activity TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
