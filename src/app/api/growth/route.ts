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

    const result = await runGEOAnalysis(targetUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Growth agent error:', error);
    return NextResponse.json(
      { error: 'Failed to run content agent. Please try again.' },
      { status: 500 }
    );
  }
}
