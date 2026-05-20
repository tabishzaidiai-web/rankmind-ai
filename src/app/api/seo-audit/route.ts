import { NextRequest, NextResponse } from 'next/server';
import { runSEOAudit } from '@/lib/agents/seo-audit-agent';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
    const result = await runSEOAudit(targetUrl, user?.email);

    // Log to timeline_events (best-effort)
    if (user) {
      try {
        const issueCount = result.action_plan?.length ?? 0;
        await supabase.from('timeline_events').insert({
          user_id: user.id,
          agent: 'RankBot',
          action: 'Completed SEO Audit',
          outcome: `SEO Score: ${result.overall_score}/100 — ${issueCount} action items found`,
        });
      } catch { /* non-critical */ }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('SEO Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to run SEO audit. Please try again.' },
      { status: 500 }
    );
  }
}
