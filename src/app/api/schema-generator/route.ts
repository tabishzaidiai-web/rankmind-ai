import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSchemaMarkup } from '@/lib/agents/schema-agent';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, pageType } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const result = await generateSchemaMarkup(url, pageType);

    // Save to database
    await supabase.from('schema_generations').insert({
      user_id: user.id,
      url: result.url,
      page_type: result.page_type,
      schemas: result.schemas,
      implementation_guide: result.implementation_guide,
      expected_improvements: result.expected_improvements,
      validation_checklist: result.validation_checklist,
      generated_at: result.generated_at,
    });

    // Log timeline event
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      agent: 'SchemaBot',
      action: `Schema markup generated for ${url} — ${result.schemas.length} schema types created`,
      details: `Types: ${result.schemas.map(s => s.type).join(', ')}`,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Schema generation error:', err);
    return NextResponse.json({ error: 'Generation failed', details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('schema_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(10);

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
