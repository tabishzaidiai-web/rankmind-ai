/**
 * RankMind AI — Plan Enforcement Middleware
 *
 * Provides server-side plan checking, usage tracking, and feature gating
 * for all API routes. Uses the Supabase service-role client so it works
 * in both cookie-based (Next.js server) and token-based (API) contexts.
 */

import { createClient } from '@supabase/supabase-js';

export type PlanType = 'free' | 'starter' | 'growth' | 'enterprise';

export interface PlanLimits {
  auditsPerMonth: number;       // -1 = unlimited
  keywordsLimit: number;
  websitesLimit: number;
  backlinksPerWeek: number;
  outreachEmailsPerWeek: number;
  geoAccess: boolean;
  contentWriterAccess: boolean;
  backlinkBuilderAccess: boolean;
  customAgentInstructions: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    auditsPerMonth: 3,
    keywordsLimit: 0,
    websitesLimit: 0,
    backlinksPerWeek: 0,
    outreachEmailsPerWeek: 0,
    geoAccess: false,
    contentWriterAccess: false,
    backlinkBuilderAccess: false,
    customAgentInstructions: false,
  },
  starter: {
    auditsPerMonth: 30,
    keywordsLimit: 20,
    websitesLimit: 1,
    backlinksPerWeek: 0,
    outreachEmailsPerWeek: 0,
    geoAccess: false,
    contentWriterAccess: false,
    backlinkBuilderAccess: false,
    customAgentInstructions: false,
  },
  growth: {
    auditsPerMonth: 60,
    keywordsLimit: 100,
    websitesLimit: 5,
    backlinksPerWeek: 10,
    outreachEmailsPerWeek: 20,
    geoAccess: false,
    contentWriterAccess: false,
    backlinkBuilderAccess: true,
    customAgentInstructions: false,
  },
  enterprise: {
    auditsPerMonth: -1,
    keywordsLimit: -1,
    websitesLimit: -1,
    backlinksPerWeek: -1,
    outreachEmailsPerWeek: -1,
    geoAccess: true,
    contentWriterAccess: true,
    backlinkBuilderAccess: true,
    customAgentInstructions: true,
  },
};

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Resolve the plan for a user identified by their JWT token.
 * Supports both Bearer token (Authorization header) and cookie-based auth.
 */
export async function getUserPlanFromToken(
  authHeader: string | null
): Promise<{ userId: string; plan: PlanType; limits: PlanLimits } | null> {
  if (!authHeader) return null;

  const supabase = getServiceClient();
  const token = authHeader.replace('Bearer ', '').trim();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const plan = normalisePlan(user.user_metadata?.selected_plan);
  return { userId: user.id, plan, limits: PLAN_LIMITS[plan] };
}

/**
 * Resolve the plan for a user already identified (e.g. from cookie auth).
 */
export function getUserPlanFromUser(user: {
  id: string;
  user_metadata?: Record<string, unknown>;
}): { userId: string; plan: PlanType; limits: PlanLimits } {
  const plan = normalisePlan(user.user_metadata?.selected_plan as string | undefined);
  return { userId: user.id, plan, limits: PLAN_LIMITS[plan] };
}

function normalisePlan(raw: string | undefined): PlanType {
  const p = (raw || '').toLowerCase();
  if (p === 'enterprise') return 'enterprise';
  if (p === 'growth' || p === 'pro') return 'growth';
  if (p === 'starter') return 'starter';
  return 'free';
}

/**
 * Check how many times a feature has been used within a rolling period.
 */
export async function checkUsage(
  userId: string,
  feature: string,
  period: 'month' | 'week',
  limit: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  if (limit === -1) return { allowed: true, used: 0, remaining: -1 };

  const supabase = getServiceClient();
  const since =
    period === 'month'
      ? new Date(Date.now() - 30 * 86_400_000).toISOString()
      : new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { count } = await supabase
    .from('usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', since);

  const used = count || 0;
  return {
    allowed: used < limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * Record a feature usage event.
 */
export async function trackUsage(userId: string, feature: string): Promise<void> {
  const supabase = getServiceClient();
  await supabase.from('usage_tracking').insert({
    user_id: userId,
    feature,
    created_at: new Date().toISOString(),
  });
}
