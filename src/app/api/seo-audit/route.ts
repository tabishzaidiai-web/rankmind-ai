import { NextRequest, NextResponse } from 'next/server';
import { runSEOAudit } from '@/lib/agents/seo-audit-agent';
import { createClient } from '@/lib/supabase/server';
import { getUserPlanFromUser, checkUsage, trackUsage } from '@/lib/plan-middleware';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── Auth enforcement — seo-audit requires a logged-in account ──
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ── Plan & usage check ──
    const userPlan = getUserPlanFromUser(user);
    const usage = await checkUsage(
      userPlan.userId,
      'seo_audit',
      'month',
      userPlan.limits.auditsPerMonth
    );

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Audit limit reached (${usage.used}/${userPlan.limits.auditsPerMonth} this month). Upgrade your plan for more audits.`,
          upgradeRequired: true,
          currentPlan: userPlan.plan,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Pass user email so the agent emails the full report on completion
    const result = await runSEOAudit(targetUrl, user.email);

    // ── Track usage ──
    await trackUsage(userPlan.userId, 'seo_audit');

    // ── Log to timeline_events (best-effort) ──
    try {
      const issueCount = result.action_plan?.length ?? 0;
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        agent: 'RankBot',
        action: 'Completed SEO Audit',
        outcome: `SEO Score: ${result.overall_score}/100 — ${issueCount} action items found`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      ...result,
      _meta: {
        plan: userPlan.plan,
        auditsUsed: usage.used + 1,
        auditsLimit: userPlan.limits.auditsPerMonth,
        auditsRemaining: Math.max(0, usage.remaining - 1),
      },
    });
  } catch (error) {
    console.error('SEO Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to run SEO audit. Please try again.' },
      { status: 500 }
    );
  }
}
