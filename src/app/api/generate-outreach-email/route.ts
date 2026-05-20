import { NextRequest, NextResponse } from 'next/server';
import { agentWrite } from '@/lib/agents/core';

export async function POST(request: NextRequest) {
  try {
    const { domain, url, type } = await request.json();
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const prompt = `Write a short, natural outreach email (under 150 words, 3 paragraphs) to ${domain} for a ${type?.replace(/_/g, ' ') || 'guest post'} opportunity.

Paragraph 1: A genuine, specific compliment about their site content — reference something real about their niche/topic based on their URL: ${url}
Paragraph 2: Who I am — RankMind AI, an autonomous SEO platform that helps agencies and businesses rank higher on Google and AI search engines like ChatGPT and Perplexity.
Paragraph 3: A clear, polite ask to contribute a guest post on SEO automation or AI search optimization.

Sound human. No guarantees. No fake stats. No excessive flattery.

Return ONLY a JSON object with this exact shape:
{
  "subject": "email subject line",
  "body": "full email body text"
}`;

    const raw = await agentWrite(
      'You are a professional outreach specialist. Write concise, human-sounding outreach emails. Return only valid JSON.',
      prompt,
      300
    );

    // Parse the JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ subject: parsed.subject, body: parsed.body });
  } catch (error) {
    console.error('[GENERATE_OUTREACH_EMAIL_ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate outreach email' }, { status: 500 });
  }
}
