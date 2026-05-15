-- RankMind AI Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Websites table
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  niche TEXT,
  geo_score INTEGER,
  last_audit TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_websites_user_id ON public.websites(user_id);

-- Keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('primary', 'secondary', 'supporting', 'long-tail', 'trust')),
  competition TEXT NOT NULL DEFAULT 'medium' CHECK (competition IN ('low', 'medium', 'high')),
  geo_relevance INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_keywords_website_id ON public.keywords(website_id);

-- Backlink Plans
CREATE TABLE IF NOT EXISTS public.backlink_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  timeline_weeks INTEGER NOT NULL DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backlink_plans_website_id ON public.backlink_plans(website_id);

-- Backlink Opportunities
CREATE TABLE IF NOT EXISTS public.backlink_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.backlink_plans(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  site_type TEXT NOT NULL CHECK (site_type IN ('guest-post', 'directory', 'resource-page', 'forum', 'niche-edit', 'broken-link')),
  keyword TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  dofollow BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'outreached', 'published', 'rejected')),
  scheduled_date DATE,
  week_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backlink_opportunities_plan_id ON public.backlink_opportunities(plan_id);

-- Content Pieces
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog-post', 'landing-page', 'pillar-content', 'faq-page')),
  llm_readability_score INTEGER,
  content TEXT,
  doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_pieces_website_id ON public.content_pieces(website_id);

-- Growth Leads
CREATE TABLE IF NOT EXISTS public.growth_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'producthunt', 'cold-outreach')),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  url TEXT,
  outreach_draft TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_growth_leads_website_id ON public.growth_leads(website_id);

-- Reddit Opportunities
CREATE TABLE IF NOT EXISTS public.reddit_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  suggested_reply TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reddit_opportunities_website_id ON public.reddit_opportunities(website_id);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own websites" ON public.websites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own websites" ON public.websites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own websites" ON public.websites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own websites" ON public.websites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own keywords" ON public.keywords FOR SELECT USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage own keywords" ON public.keywords FOR ALL USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own backlink plans" ON public.backlink_plans FOR SELECT USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage own backlink plans" ON public.backlink_plans FOR ALL USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own backlink opportunities" ON public.backlink_opportunities FOR SELECT USING (
  plan_id IN (SELECT bp.id FROM public.backlink_plans bp JOIN public.websites w ON bp.website_id = w.id WHERE w.user_id = auth.uid())
);

CREATE POLICY "Users can view own content" ON public.content_pieces FOR SELECT USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage own content" ON public.content_pieces FOR ALL USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own leads" ON public.growth_leads FOR SELECT USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own reddit ops" ON public.reddit_opportunities FOR SELECT USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
