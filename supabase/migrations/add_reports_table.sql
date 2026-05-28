-- RankMind AI — Reports Table Migration
-- Run this in your Supabase SQL editor

-- Reports table: stores generated report metadata
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'seo-audit',
  overall_score INTEGER,
  grade TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Storage bucket for PDF files (run separately if bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can read own report files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service role can upload report files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports');

-- Rate limit trigger: free users limited to 1 report per month
CREATE OR REPLACE FUNCTION check_report_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  report_count INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier FROM users WHERE id = NEW.user_id;

  -- Count reports in last 30 days
  SELECT COUNT(*) INTO report_count FROM reports
  WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '30 days';

  -- Free users: max 1 report per month
  IF user_tier IS NULL OR user_tier = 'free' THEN
    IF report_count >= 1 THEN
      RAISE EXCEPTION 'Free plan limited to 1 report per month. Upgrade to Starter ($5/mo) for unlimited reports.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_report_limit
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION check_report_limit();
