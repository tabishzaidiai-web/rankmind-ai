import { NextRequest, NextResponse } from 'next/server';
import { runBacklinkCampaign } from '@/lib/agents/backlink-agent';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { url, niche, targetCount = 10 } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const result = await runBacklinkCampaign(targetUrl, targetCount, user.email, niche);

    // Log to timeline_events (best-effort)
    try {
      const prospectCount = result.opportunities?.length ?? 0;
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        agent: 'LinkBot',
        action: 'Found backlink opportunities',
        outcome: `${prospectCount} prospects found for ${niche || 'your niche'}`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Backlink agent error:', error);
    const message = error instanceof Error ? error.message : 'Failed to run backlink agent. Please try again.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: jobs } = await supabase
      .from('agent_jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('agent_type', 'backlink')
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Backlink GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch backlink jobs' }, { status: 500 });
  }
}
