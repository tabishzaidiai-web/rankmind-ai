-- RankMind AI — Bug Fix Migration (005)
-- Fixes: onboarding_completed column, backlink_opportunities schema, RLS policies

-- ─── 1. Ensure users table has all required columns ───────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS target_keywords TEXT,
  ADD COLUMN IF NOT EXISTS goals TEXT,
  ADD COLUMN IF NOT EXISTS niche TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free';

-- ─── 2. Ensure users row is auto-created on signup ────────────────────────────
-- This trigger creates a public.users row whenever a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. Backfill any existing auth users who don't have a public.users row ────
INSERT INTO public.users (id, email, name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ─── 4. Fix backlink_opportunities table ──────────────────────────────────────
-- Add user_id and website_id columns (the old schema only had plan_id)
ALTER TABLE public.backlink_opportunities
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS da_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'guest_post',
  ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS outreach_email JSONB,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS has_write_for_us BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS niche_relevance INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS estimated_da INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Ensure status column has correct default
ALTER TABLE public.backlink_opportunities
  ALTER COLUMN status SET DEFAULT 'new';

-- ─── 5. Enable RLS on all tables ──────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS Policies for users ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 7. RLS Policies for websites ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;
CREATE POLICY "Users can view own websites"
  ON public.websites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own websites" ON public.websites;
CREATE POLICY "Users can insert own websites"
  ON public.websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own websites" ON public.websites;
CREATE POLICY "Users can update own websites"
  ON public.websites FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access websites" ON public.websites;
CREATE POLICY "Service role full access websites"
  ON public.websites FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 8. RLS Policies for backlink_opportunities ───────────────────────────────
DROP POLICY IF EXISTS "Users can view own backlinks" ON public.backlink_opportunities;
CREATE POLICY "Users can view own backlinks"
  ON public.backlink_opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own backlinks" ON public.backlink_opportunities;
CREATE POLICY "Users can insert own backlinks"
  ON public.backlink_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own backlinks" ON public.backlink_opportunities;
CREATE POLICY "Users can update own backlinks"
  ON public.backlink_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access backlinks" ON public.backlink_opportunities;
CREATE POLICY "Service role full access backlinks"
  ON public.backlink_opportunities FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 9. RLS Policies for keywords ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own keywords" ON public.keywords;
CREATE POLICY "Users can view own keywords"
  ON public.keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.websites w
      WHERE w.id = keywords.website_id AND w.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own keywords" ON public.keywords;
CREATE POLICY "Users can insert own keywords"
  ON public.keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.websites w
      WHERE w.id = keywords.website_id AND w.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access keywords" ON public.keywords;
CREATE POLICY "Service role full access keywords"
  ON public.keywords FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 10. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(id, onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_backlink_opps_user_id ON public.backlink_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_user_id_v2 ON public.websites(user_id);
