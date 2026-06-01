import { NextRequest, NextResponse } from 'next/server';
import { runBacklinkCampaign } from '@/lib/agents/backlink-agent';
import { searchBacklinkOpportunities } from '@/lib/serper';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // ── Health-check log: confirm SERPER key is loaded ──
  console.log('[Backlinks] SERPER_API_KEY exists:', !!process.env.SERPER_API_KEY);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // ── Run both in parallel: AI campaign + SERPER direct search ──
    const [campaignResult, serperOpps] = await Promise.allSettled([
      runBacklinkCampaign(targetUrl, targetCount, user.email, niche),
      searchBacklinkOpportunities(niche || 'SEO', targetUrl),
    ]);

    // Prefer the AI campaign result; fall back to SERPER-only if campaign fails
    const result =
      campaignResult.status === 'fulfilled'
        ? campaignResult.value
        : null;

    const serperResults =
      serperOpps.status === 'fulfilled' ? serperOpps.value : [];

    if (!result && serperResults.length === 0) {
      const errMsg =
        campaignResult.status === 'rejected'
          ? (campaignResult.reason instanceof Error
              ? campaignResult.reason.message
              : 'Failed to run backlink agent. Please try again.')
          : 'No backlink opportunities found. Try a different niche.';
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    // ── Merge: enrich AI opportunities with SERPER domain data ──
    // Build a quick lookup: domain → serper data
    const serperMap = new Map(
      serperResults.map((s) => [s.domain_name, s])
    );

    // If AI campaign succeeded, patch any "Pending Enrichment" domains with SERPER data
    if (result && result.opportunities) {
      result.opportunities = result.opportunities.map((opp, idx) => {
        const isPending =
          !opp.domain ||
          opp.domain === 'Pending Enrichment' ||
          opp.domain === 'unknown';

        if (isPending && serperResults[idx]) {
          const s = serperResults[idx];
          return {
            ...opp,
            domain: s.domain_name,
            url: opp.url || s.site_url,
            estimated_da: opp.estimated_da || s.estimated_da,
            contact_email: opp.contact_email || s.contact_email,
            niche_relevance: opp.niche_relevance || s.niche_relevance,
            type: opp.type || s.site_type,
          };
        }

        // Also enrich DA/email from SERPER if AI left them at defaults
        const serperMatch = serperMap.get(opp.domain);
        if (serperMatch) {
          return {
            ...opp,
            estimated_da: opp.estimated_da > 0 ? opp.estimated_da : serperMatch.estimated_da,
            contact_email: opp.contact_email || serperMatch.contact_email,
          };
        }

        return opp;
      });
    }

    // If AI campaign failed entirely, build a synthetic campaign from SERPER results
    const finalResult = result ?? {
      campaign_id: `camp_serper_${Date.now()}`,
      client_url: targetUrl,
      client_niche: niche || 'SEO',
      target_keywords: [niche || 'SEO'],
      opportunities: serperResults.map((s, i) => ({
        id: `opp_${i + 1}`,
        domain: s.domain_name,
        url: s.site_url,
        title: s.title,
        type: s.site_type as 'guest_post' | 'resource_link' | 'directory' | 'forum' | 'web2',
        estimated_da: s.estimated_da,
        niche_relevance: s.niche_relevance,
        contact_email: s.contact_email,
        contact_page: null,
        has_write_for_us: s.snippet.toLowerCase().includes('write for us'),
        status: 'qualified' as const,
        notes: s.snippet.slice(0, 120),
      })),
      articles_written: 0,
      outreach_sent: 0,
      links_secured: 0,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'completed' as const,
      next_steps: [
        `Send outreach emails to ${serperResults.length} qualified sites`,
        'Follow up after 5-7 days if no response',
        'Submit guest post articles once sites approve',
      ],
    };

    // ── Persist to backlink_opportunities (best-effort) ──
    try {
      const { data: website } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const websiteId = website?.id ?? null;

      if (finalResult.opportunities && finalResult.opportunities.length > 0) {
        const rows = finalResult.opportunities.map((opp) => ({
          user_id: user.id,
          website_id: websiteId,
          site_url: opp.url || '',
          domain_name: opp.domain || 'Pending Enrichment',
          estimated_da: opp.estimated_da ?? null,
          contact_email: opp.contact_email ?? null,
          niche_relevance: opp.niche_relevance ?? null,
          site_type: opp.type || 'guest_post',
          anchor_text: null,
          keyword: finalResult.target_keywords?.[0] ?? null,
          status: 'pending',
          dofollow: true,
        }));

        await supabase.from('backlink_opportunities').insert(rows);
      }
    } catch (saveErr) {
      console.warn('[LinkBot] Failed to save opportunities to DB:', saveErr);
    }

    // ── Log to timeline_events (best-effort) ──
    try {
      const prospectCount = finalResult.opportunities?.length ?? 0;
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        agent: 'LinkBot',
        action: 'Found backlink opportunities',
        outcome: `${prospectCount} prospects found for ${niche || 'your niche'}`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error('Backlink agent error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to run backlink agent. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
