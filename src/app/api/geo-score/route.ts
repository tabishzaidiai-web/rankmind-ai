import { NextRequest, NextResponse } from 'next/server';
import { runGEOAnalysis } from '@/lib/agents/geo-content-agent';
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
    const { url } = body;
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    const result = await runGEOAnalysis(targetUrl, user.email);

    // Save results to geo_scores table for dashboard KPI (best-effort)
    try {
      const { data: website } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (website?.id) {
        await supabase.from('geo_scores').insert({
          website_id: website.id,
          user_id: user.id,
          url: targetUrl,
          visibility_score: result.geo_score,
          ai_citation_readiness_score: result.ai_visibility?.eeat_score ?? null,
          google_ai_mode_score: result.ai_visibility?.google_ai_mode_score ?? null,
          semantic_completeness_score: result.ai_visibility?.semantic_completeness_score ?? null,
          entity_density_score: result.ai_visibility?.entity_density_score ?? null,
          eeat_score: result.ai_visibility?.eeat_score ?? null,
        });
      }
    } catch { /* non-critical */ }

    // Log to timeline_events (best-effort)
    try {
      const gapCount = result.content_gaps?.length ?? 0;
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        agent: 'GEO-G',
        action: 'Completed GEO Visibility Scan',
        outcome: `GEO Score: ${result.geo_score}/100 — ${gapCount} content gaps identified`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GEO agent error:', error);
    return NextResponse.json(
      { error: 'Failed to run GEO optimization. Please try again.' },
      { status: 500 }
    );
  }
}
