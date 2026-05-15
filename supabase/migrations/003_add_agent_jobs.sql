-- Migration 003: Add agent_jobs table for tracking all AI agent runs
-- Also adds subscription_tier column to users table

-- Add subscription_tier to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Create agent_jobs table
CREATE TABLE IF NOT EXISTS agent_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('seo_audit', 'backlink_builder', 'geo_optimizer', 'content_writer')),
  target_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused', 'awaiting_approval')),
  result JSONB,
  error TEXT,
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  run_count INTEGER DEFAULT 0,
  next_run_at TIMESTAMPTZ,
  frequency TEXT CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly'))
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_agent_jobs_user_id ON agent_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON agent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_scheduled_for ON agent_jobs(scheduled_for);

-- Enable Row Level Security
ALTER TABLE agent_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs
CREATE POLICY "Users can view own agent jobs" ON agent_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agent jobs" ON agent_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent jobs" ON agent_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for the scheduler)
CREATE POLICY "Service role full access" ON agent_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_jobs_updated_at
  BEFORE UPDATE ON agent_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
