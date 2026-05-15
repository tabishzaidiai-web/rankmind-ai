/**
 * RankMind AI - Core Agent Engine
 * Powers all SEO agents with OpenAI reasoning, web search, and email capabilities
 */

import OpenAI from 'openai';

// Lazy initialization — only create the client when actually needed (not at build time)
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentStep {
  step: number;
  action: string;
  result: string;
  timestamp: string;
}

export interface AgentRun {
  run_id: string;
  agent_type: 'seo_audit' | 'backlink_builder' | 'geo_optimizer' | 'content_writer';
  status: 'running' | 'waiting_approval' | 'completed' | 'failed' | 'paused';
  steps: AgentStep[];
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Core reasoning function — calls OpenAI with a structured prompt
 * and returns the parsed JSON response
 */
export async function agentReason<T>(
  systemPrompt: string,
  userPrompt: string,
  conversationHistory: AgentMessage[] = []
): Promise<T> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userPrompt },
  ];

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content) as T;
}

/**
 * Agent reasoning without JSON format (for free-form text generation)
 */
export async function agentWrite(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Google Custom Search — finds real websites for backlink opportunities
 */
export async function googleSearch(
  query: string,
  numResults = 10
): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    throw new Error('Google Search API key or CX not configured');
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${Math.min(numResults, 10)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Google Search API error: ${data.error?.message || 'Unknown error'}`);
  }

  return (data.items || []).map((item: { title: string; link: string; snippet: string }) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
  }));
}

/**
 * Fetch and parse a webpage — extracts title, meta description, headings, and text
 */
export async function fetchPageContent(url: string): Promise<{
  title: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  bodyText: string;
  wordCount: number;
  statusCode: number;
  loadTime: number;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RankMindBot/1.0; +https://rankmind-ai.vercel.app)',
      },
      signal: AbortSignal.timeout(15000),
    });

    const loadTime = Date.now() - startTime;
    const html = await response.text();

    // Parse with regex for edge runtime compatibility
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].trim() : '';

    const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)];
    const h2s = h2Matches.map(m => m[1].trim()).slice(0, 10);

    // Strip HTML tags for body text
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);

    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

    return {
      title,
      metaDescription,
      h1,
      h2s,
      bodyText,
      wordCount,
      statusCode: response.status,
      loadTime,
    };
  } catch (error) {
    return {
      title: '',
      metaDescription: '',
      h1: '',
      h2s: [],
      bodyText: '',
      wordCount: 0,
      statusCode: 0,
      loadTime: Date.now() - startTime,
    };
  }
}

/**
 * Check if a URL is accessible and returns basic info
 */
export async function checkUrl(url: string): Promise<{
  accessible: boolean;
  statusCode: number;
  hasContactPage: boolean;
  hasWriteForUs: boolean;
}> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RankMindBot/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    // Check for write for us / guest post page
    const writeForUsUrl = new URL('/write-for-us', url).href;
    const guestPostUrl = new URL('/guest-post', url).href;
    const contactUrl = new URL('/contact', url).href;

    const [writeCheck, contactCheck] = await Promise.allSettled([
      fetch(writeForUsUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) }),
      fetch(contactUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) }),
    ]);

    const hasWriteForUs = writeCheck.status === 'fulfilled' && writeCheck.value.ok;
    const hasContactPage = contactCheck.status === 'fulfilled' && contactCheck.value.ok;

    return {
      accessible: response.ok,
      statusCode: response.status,
      hasContactPage,
      hasWriteForUs,
    };
  } catch {
    return { accessible: false, statusCode: 0, hasContactPage: false, hasWriteForUs: false };
  }
}

/**
 * Send email via Resend API
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: 'Resend API key not configured' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from || 'RankMind AI <noreply@rankmind-ai.vercel.app>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Generate a unique run ID
 */
export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
