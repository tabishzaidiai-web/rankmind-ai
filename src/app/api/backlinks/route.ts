import { NextRequest, NextResponse } from 'next/server';
import { runBacklinkCampaign } from '@/lib/agents/backlink-agent';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

/** Extract clean domain from a URL — never returns 'unknown' */
function extractDomain(url: string): string {
  if (!url) return 'Pending Enrichment';
  try {
    const hostname = new URL(
      url.startsWith('http') ? url : `https://${url}`
    ).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return 'Pending Enrichment';
  }
}

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

    // ── Persist opportunities to backlink_opportunities (best-effort) ──
    try {
      // Look up the user's primary website_id
      const { data: website } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const websiteId = website?.id ?? null;

      if (result.opportunities && result.opportunities.length > 0) {
        const rows = result.opportunities.map((opp) => ({
          user_id: user.id,
          website_id: websiteId,
          site_url: opp.url || '',
          domain_name: opp.domain || extractDomain(opp.url || ''),
          estimated_da: opp.estimated_da ?? null,
          contact_email: opp.contact_email ?? null,
          niche_relevance: opp.niche_relevance ?? null,
          site_type: opp.type || 'guest_post',
          anchor_text: null,
          keyword: result.target_keywords?.[0] ?? null,
          status: 'pending',
          dofollow: true,
        }));

        await supabase.from('backlink_opportunities').insert(rows);
      }
    } catch (saveErr) {
      // Non-critical — log but don't fail the response
      console.warn('[LinkBot] Failed to save opportunities to DB:', saveErr);
    }

    // ── Log to timeline_events (best-effort) ──
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
