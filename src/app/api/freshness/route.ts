import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runFreshnessAnalysis } from '@/lib/agents/freshness-agent';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const result = await runFreshnessAnalysis(url);

    await supabase.from('freshness_analyses').insert({
      user_id: user.id,
      url: result.url,
      overall_freshness_score: result.overall_freshness_score,
      site_assessment: result.site_assessment,
      pages_to_update: result.pages_to_update,
      update_recommendations: result.update_recommendations,
      new_content_opportunities: result.new_content_opportunities,
      refresh_plan: result.refresh_plan,
      analyzed_at: result.analyzed_at,
    });

    await supabase.from('timeline_events').insert({
      user_id: user.id,
      agent: 'FreshnessBot',
      action: `Content freshness analysis for ${url} — Score: ${result.overall_freshness_score}/100`,
      details: `Decay risk: ${result.site_assessment.content_age_risk} — ${result.pages_to_update.length} pages need updating`,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Freshness error:', err);
    return NextResponse.json({ error: 'Analysis failed', details: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('freshness_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('analyzed_at', { ascending: false })
      .limit(10);

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
