import { NextRequest, NextResponse } from 'next/server';
import { fetchPageContent, agentReason } from '@/lib/agents/core';

export const maxDuration = 60; // Allow up to 60 seconds for AI analysis

export async function POST(request: NextRequest) {
  try {
    const { url, keyword } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // 1. Fetch page content
    const pageData = await fetchPageContent(normalizedUrl);

    // 2. Run a targeted GEO visibility scan
    const scanResult = await agentReason<{
      overall_visibility: number;
      perplexity_status: 'cited' | 'excluded' | 'partial';
      chatgpt_status: 'cited' | 'excluded' | 'partial';
      reasoning: string;
      missing_elements: string[];
      quick_fix: string;
      competitor_edge: string;
    }>(
      `You are a GEO (Generative Engine Optimization) Scanner. Analyze if this website would be cited by AI search engines (Perplexity, ChatGPT Search) for the keyword: "${keyword || 'general industry search'}".
      
      Focus on:
      - Semantic density for the keyword
      - Citation-readiness of the text
      - Presence of structured data
      - Directness of answers`,
      `URL: ${normalizedUrl}
      Keyword: ${keyword || 'N/A'}
      Page Title: ${pageData.title}
      Content Snippet: ${pageData.bodyText.slice(0, 2000)}
      
      Return JSON:
      {
        "overall_visibility": 0-100,
        "perplexity_status": "cited" | "excluded" | "partial",
        "chatgpt_status": "cited" | "excluded" | "partial",
        "reasoning": "1-2 sentence explanation of why they are or aren't cited",
        "missing_elements": ["3 specific things missing"],
        "quick_fix": "The #1 thing they should do right now",
        "competitor_edge": "What their competitors are doing better in AI search"
      }`
    );

    return NextResponse.json(scanResult);
  } catch (error: any) {
    console.error('GEO Scanner Error:', error);
    return NextResponse.json({ error: 'Failed to scan visibility' }, { status: 500 });
  }
}
