import { NextRequest, NextResponse } from 'next/server';

// ── In-memory rate limiter (3 audits per IP per hour) ──────────────────────
// For production scale, swap this map for a Redis/Upstash store.
const ipStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();
  const fwdIp = req.headers.get('x-forwarded-for');
  if (fwdIp) return fwdIp.split(',')[0].trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

// ── Lightweight crawler ────────────────────────────────────────────────────
interface CrawlResult {
  finalUrl: string;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  hasViewport: boolean;
  hasHttps: boolean;
  responseTimeMs: number;
  statusCode: number;
}

async function crawlPage(rawUrl: string): Promise<CrawlResult> {
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const start = Date.now();

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RankMindBot/1.0 (SEO audit; +https://www.rank-mind.com)',
      Accept: 'text/html',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
  });

  const responseTimeMs = Date.now() - start;
  const html = await res.text();

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Meta description
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : null;

  // H1 tags
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Tags = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 5);

  // Viewport
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

  return {
    finalUrl: res.url,
    title,
    metaDescription,
    h1Tags,
    hasViewport,
    hasHttps: res.url.startsWith('https://'),
    responseTimeMs,
    statusCode: res.status,
  };
}

// ── Score helpers ──────────────────────────────────────────────────────────
function scoreTitle(title: string | null): { score: number; label: string; detail: string; status: 'good' | 'warning' | 'error' } {
  if (!title) return { score: 0, label: 'Missing Title Tag', detail: 'No <title> tag found. This is critical for SEO.', status: 'error' };
  if (title.length < 30) return { score: 50, label: 'Title Too Short', detail: `"${title}" — only ${title.length} chars. Aim for 50–60.`, status: 'warning' };
  if (title.length > 65) return { score: 60, label: 'Title Too Long', detail: `"${title.slice(0, 55)}…" — ${title.length} chars. Keep under 60.`, status: 'warning' };
  return { score: 100, label: 'Title Tag Optimised', detail: `"${title.slice(0, 60)}" — ${title.length} chars. Perfect length.`, status: 'good' };
}

function scoreMeta(meta: string | null): { score: number; label: string; detail: string; status: 'good' | 'warning' | 'error' } {
  if (!meta) return { score: 0, label: 'Missing Meta Description', detail: 'No meta description found. Add one to improve click-through rate.', status: 'error' };
  if (meta.length < 70) return { score: 50, label: 'Meta Description Too Short', detail: `${meta.length} chars. Aim for 120–160 characters.`, status: 'warning' };
  if (meta.length > 165) return { score: 65, label: 'Meta Description Too Long', detail: `${meta.length} chars. Keep under 160 to avoid truncation.`, status: 'warning' };
  return { score: 100, label: 'Meta Description Optimised', detail: `${meta.length} chars. Good length for search snippets.`, status: 'good' };
}

function scoreH1(h1Tags: string[]): { score: number; label: string; detail: string; status: 'good' | 'warning' | 'error' } {
  if (h1Tags.length === 0) return { score: 0, label: 'No H1 Tag Found', detail: 'Every page needs exactly one H1 tag for SEO structure.', status: 'error' };
  if (h1Tags.length > 1) return { score: 60, label: 'Multiple H1 Tags', detail: `Found ${h1Tags.length} H1 tags: "${h1Tags[0]}". Use only one per page.`, status: 'warning' };
  return { score: 100, label: 'H1 Tag Present', detail: `"${h1Tags[0].slice(0, 70)}${h1Tags[0].length > 70 ? '…' : ''}"`, status: 'good' };
}

function scorePageSpeed(responseTimeMs: number): { score: number; label: string; detail: string; status: 'good' | 'warning' | 'error' } {
  if (responseTimeMs < 800) return { score: 100, label: 'Fast Response Time', detail: `Server responded in ${responseTimeMs}ms. Excellent.`, status: 'good' };
  if (responseTimeMs < 2000) return { score: 70, label: 'Moderate Response Time', detail: `Server responded in ${responseTimeMs}ms. Aim for under 800ms.`, status: 'warning' };
  return { score: 30, label: 'Slow Response Time', detail: `Server responded in ${responseTimeMs}ms. This hurts Core Web Vitals.`, status: 'error' };
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    const minutesLeft = Math.ceil((resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      {
        rateLimited: true,
        signupUrl: '/signup',
        message: `You've used all ${RATE_LIMIT} free audits this hour. Sign up free to run unlimited audits.`,
        resetInMinutes: minutesLeft,
      },
      { status: 429 }
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const rawUrl = (body.url || '').trim();
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Basic URL validation
  try {
    const testUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    new URL(testUrl);
  } catch {
    return NextResponse.json({ error: 'Please enter a valid website URL' }, { status: 400 });
  }

  try {
    const crawled = await crawlPage(rawUrl);

    const titleFactor = scoreTitle(crawled.title);
    const metaFactor = scoreMeta(crawled.metaDescription);
    const h1Factor = scoreH1(crawled.h1Tags);
    const speedFactor = scorePageSpeed(crawled.responseTimeMs);

    const overallScore = Math.round(
      (titleFactor.score + metaFactor.score + h1Factor.score + speedFactor.score) / 4
    );

    const grade =
      overallScore >= 80 ? 'A' :
      overallScore >= 60 ? 'B' :
      overallScore >= 40 ? 'C' : 'D';

    return NextResponse.json({
      success: true,
      url: crawled.finalUrl,
      overallScore,
      grade,
      remaining,
      factors: {
        meta_title: { ...titleFactor, name: 'Meta Title' },
        meta_description: { ...metaFactor, name: 'Meta Description' },
        h1_tags: { ...h1Factor, name: 'H1 Heading' },
        page_speed: { ...speedFactor, name: 'Page Speed' },
      },
      lockedFactorCount: 6,
      crawledAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('fetch') || msg.includes('ENOTFOUND') || msg.includes('timeout')) {
      return NextResponse.json(
        { error: 'Could not reach that website. Please check the URL and try again.' },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
