import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAICitationAnalysis } from '@/lib/agents/ai-citation-agent';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, keywords } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const targetKeywords = keywords || [];
    const result = await runAICitationAnalysis(url, targetKeywords);

    // Save to database
    const { data: saved, error } = await supabase
      .from('ai_citation_analyses')
      .insert({
        user_id: user.id,
        url: result.url,
        overall_citation_score: result.overall_citation_score,
        grade: result.grade,
        platforms: result.platforms,
        content_signals: result.content_signals,
        eeat_signals: result.eeat_signals,
        schema_signals: result.schema_signals,
        freshness_signals: result.freshness_signals,
        citation_gaps: result.citation_gaps,
        action_plan: result.action_plan,
        share_of_voice: result.share_of_voice,
        analyzed_at: result.analyzed_at,
      })
      .select()
      .single();

    if (error) {
      console.error('DB save error:', error);
    }

    // Log timeline event
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      agent: 'CitationBot',
      action: `AI Citation analysis completed for ${url} — Score: ${result.overall_citation_score}/100 (${result.grade})`,
      details: `Citation readiness across Google AI Overviews, AI Mode, ChatGPT & Perplexity analyzed`,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('AI Citation error:', err);
    return NextResponse.json({ error: 'Analysis failed', details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('ai_citation_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('analyzed_at', { ascending: false })
      .limit(10);

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
