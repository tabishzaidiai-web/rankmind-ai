/**
 * RankMind AI - Agent Scheduler
 * 
 * Manages recurring agent runs for paid clients:
 * - Checks subscription status before running (stops if payment fails)
 * - Runs agents on schedule (weekly/monthly)
 * - Sends progress notifications and reports
 * - Handles free demo tier (limited runs, no cost)
 */

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './core';

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AgentType = 'seo_audit' | 'backlink_builder' | 'geo_optimizer' | 'content_writer';
export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'enterprise';

export interface AgentJobRecord {
  id: string;
  user_id: string;
  agent_type: AgentType;
  target_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'awaiting_approval';
  result: Record<string, unknown> | null;
  error: string | null;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  run_count: number;
  next_run_at: string | null;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | null;
}

/**
 * Tier permissions — what each tier can access
 */
export const TIER_PERMISSIONS: Record<SubscriptionTier, {
  agents: AgentType[];
  max_websites: number;
  max_runs_per_month: number;
  scheduling: boolean;
  email_reports: boolean;
  approval_required: boolean;
  is_demo: boolean;
}> = {
  free: {
    agents: ['seo_audit'],
    max_websites: 1,
    max_runs_per_month: 3,
    scheduling: false,
    email_reports: false,
    approval_required: true,
    is_demo: true,
  },
  starter: {
    agents: ['seo_audit'],
    max_websites: 3,
    max_runs_per_month: 10,
    scheduling: true,
    email_reports: true,
    approval_required: false,
    is_demo: false,
  },
  growth: {
    agents: ['seo_audit', 'backlink_builder'],
    max_websites: 10,
    max_runs_per_month: 50,
    scheduling: true,
    email_reports: true,
    approval_required: false,
    is_demo: false,
  },
  enterprise: {
    agents: ['seo_audit', 'backlink_builder', 'geo_optimizer', 'content_writer'],
    max_websites: -1, // unlimited
    max_runs_per_month: -1, // unlimited
    scheduling: true,
    email_reports: true,
    approval_required: false,
    is_demo: false,
  },
};

/**
 * Check if a user has an active subscription and return their tier
 */
export async function getUserTier(userId: string): Promise<{
  tier: SubscriptionTier;
  is_active: boolean;
  subscription_status: string;
}> {
  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status, subscription_tier, current_period_end')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { tier: 'free', is_active: false, subscription_status: 'none' };
  }

  const isActive = user.subscription_status === 'active' ||
    (user.current_period_end && new Date(user.current_period_end) > new Date());

  const tier = (isActive ? (user.subscription_tier || 'starter') : 'free') as SubscriptionTier;

  return {
    tier,
    is_active: isActive,
    subscription_status: user.subscription_status || 'none',
  };
}

/**
 * Check if a user can run a specific agent
 */
export async function canRunAgent(
  userId: string,
  agentType: AgentType
): Promise<{ allowed: boolean; reason?: string; tier: SubscriptionTier }> {
  const { tier, is_active } = await getUserTier(userId);
  const permissions = TIER_PERMISSIONS[tier];

  if (!permissions.agents.includes(agentType)) {
    const requiredTier = agentType === 'backlink_builder' ? 'Growth ($79/mo)' :
                         agentType === 'geo_optimizer' || agentType === 'content_writer' ? 'Enterprise ($149/mo)' :
                         'Starter ($29/mo)';
    return {
      allowed: false,
      reason: `This agent requires the ${requiredTier} plan. Please upgrade to access it.`,
      tier,
    };
  }

  // Check monthly run limit
  if (permissions.max_runs_per_month > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('agent_jobs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if ((count || 0) >= permissions.max_runs_per_month) {
      return {
        allowed: false,
        reason: `You have reached your monthly limit of ${permissions.max_runs_per_month} runs. Upgrade your plan for more.`,
        tier,
      };
    }
  }

  return { allowed: true, tier };
}

/**
 * Create an agent job in the database
 */
export async function createAgentJob(
  userId: string,
  agentType: AgentType,
  targetUrl: string,
  frequency: AgentJobRecord['frequency'] = 'once',
  scheduledFor?: string
): Promise<AgentJobRecord | null> {
  const { data, error } = await supabase
    .from('agent_jobs')
    .insert({
      user_id: userId,
      agent_type: agentType,
      target_url: targetUrl,
      status: 'pending',
      frequency,
      scheduled_for: scheduledFor || new Date().toISOString(),
      run_count: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create agent job:', error);
    return null;
  }

  return data;
}

/**
 * Update agent job status and result
 */
export async function updateAgentJob(
  jobId: string,
  updates: Partial<AgentJobRecord>
): Promise<void> {
  await supabase
    .from('agent_jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

/**
 * Get all pending jobs that are due to run
 */
export async function getDueJobs(): Promise<AgentJobRecord[]> {
  const { data, error } = await supabase
    .from('agent_jobs')
    .select('*')
    .in('status', ['pending'])
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(10);

  if (error) return [];
  return data || [];
}

/**
 * Schedule next run for a recurring job
 */
export async function scheduleNextRun(job: AgentJobRecord): Promise<void> {
  if (!job.frequency || job.frequency === 'once') return;

  const now = new Date();
  let nextRun: Date;

  switch (job.frequency) {
    case 'weekly':
      nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'biweekly':
      nextRun = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return;
  }

  await supabase
    .from('agent_jobs')
    .insert({
      user_id: job.user_id,
      agent_type: job.agent_type,
      target_url: job.target_url,
      status: 'pending',
      frequency: job.frequency,
      scheduled_for: nextRun.toISOString(),
      run_count: (job.run_count || 0) + 1,
      created_at: new Date().toISOString(),
    });
}

/**
 * Pause all jobs for a user (called when subscription expires)
 */
export async function pauseUserJobs(userId: string): Promise<void> {
  await supabase
    .from('agent_jobs')
    .update({ status: 'paused' })
    .eq('user_id', userId)
    .eq('status', 'pending');
}

/**
 * Resume jobs for a user (called when subscription is renewed)
 */
export async function resumeUserJobs(userId: string): Promise<void> {
  await supabase
    .from('agent_jobs')
    .update({ status: 'pending' })
    .eq('user_id', userId)
    .eq('status', 'paused');
}

/**
 * Send subscription expiry warning email
 */
export async function sendSubscriptionWarning(
  userEmail: string,
  daysLeft: number
): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: `Action Required: Your RankMind AI subscription expires in ${daysLeft} days`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e0e0e0; padding: 30px; border-radius: 8px;">
        <h2 style="color: #ef4444;">⚠️ Subscription Expiring Soon</h2>
        <p>Your RankMind AI subscription expires in <strong>${daysLeft} days</strong>.</p>
        <p>When your subscription expires:</p>
        <ul>
          <li>All scheduled agent runs will be paused</li>
          <li>You will lose access to the Backlink Builder and GEO Optimizer</li>
          <li>Your data and reports will be preserved</li>
        </ul>
        <p>Renew now to keep your SEO campaigns running without interruption.</p>
        <a href="https://www.rank-mind.com/dashboard/billing" 
           style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Renew Subscription →
        </a>
      </div>
    `,
  });
}

/**
 * Get user's agent job history
 */
export async function getUserJobHistory(
  userId: string,
  limit = 20
): Promise<AgentJobRecord[]> {
  const { data, error } = await supabase
    .from('agent_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}
