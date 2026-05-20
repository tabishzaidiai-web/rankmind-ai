-- Create timeline_events table for agent activity feed
create table if not exists timeline_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  agent text not null,
  action text not null,
  outcome text,
  created_at timestamp with time zone default now()
);

-- Index for fast user queries
create index if not exists timeline_events_user_id_idx on timeline_events (user_id, created_at desc);

-- Enable RLS
alter table timeline_events enable row level security;

-- Users can only see their own events
create policy "Users can view own timeline events"
  on timeline_events for select
  using (auth.uid() = user_id);

-- Users can insert their own events (via server-side routes)
create policy "Service role can insert timeline events"
  on timeline_events for insert
  with check (true);
