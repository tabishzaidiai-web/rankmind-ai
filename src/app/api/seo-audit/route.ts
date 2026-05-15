import { NextRequest, NextResponse } from 'next/server';
import { runSEOAudit } from '@/lib/agents/seo-audit-agent';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const result = await runSEOAudit(targetUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('SEO Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to run SEO audit. Please try again.' },
      { status: 500 }
    );
  }
}
