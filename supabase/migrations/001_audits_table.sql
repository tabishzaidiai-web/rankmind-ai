-- RankMind AI: Audits table for storing SEO audit history
-- Run this in your Supabase SQL Editor

-- Create the audits table
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'F',
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB DEFAULT '{}'::jsonb,
  audit_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'weekly_cron' | 'onboarding'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Users can only read their own audits
CREATE POLICY "Users can view own audits"
  ON public.audits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own audits
CREATE POLICY "Users can insert own audits"
  ON public.audits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for cron jobs)
CREATE POLICY "Service role full access"
  ON public.audits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS audits_user_id_created_at_idx
  ON public.audits (user_id, created_at DESC);

-- Also create/update the users table with website_url column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Grant permissions
GRANT SELECT, INSERT ON public.audits TO authenticated;
GRANT ALL ON public.audits TO service_role;
