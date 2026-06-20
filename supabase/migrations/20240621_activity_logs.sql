CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  action_text text NOT NULL,
  status text DEFAULT 'success',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
