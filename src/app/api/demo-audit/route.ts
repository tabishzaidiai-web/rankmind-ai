import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory rate limit: 3 requests per IP per day
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + dayMs });
    return { allowed: true, remaining: 2 };
  }
  if (entry.count >= 3) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: 3 - entry.count };
}

// Step 1: Validate URL actually exists
async function validateUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankMindBot/1.0)' },
      redirect: 'follow',
    });
    return { exists: response.ok || response.status === 405, statusCode: response.status, finalUrl: response.url || url };
  } catch (error: unknown) {
    return { exists: false, statusCode: 0, finalUrl: url, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Step 2: Crawl real HTML and extract data
async function crawlPage(url: string) {
  const start = Date.now();
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankMindBot/1.0)' },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const responseTimeMs = Date.now() - start;
  const $ = cheerio.load(html);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { hostname = url; }

  return {
    title: $('title').text().trim() || null,
    metaDescription: $('meta[name="description"]').attr('content') || null,
    h1Tags: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    imageCount: $('img').length,
    imagesWithoutAlt: $('img').filter((_, el) => !$(el).attr('alt') || $(el).attr('alt') === '').length,
    hasCanonical: $('link[rel="canonical"]').length > 0,
    hasSchema: $('script[type="application/ld+json"]').length > 0,
    hasViewport: $('meta[name="viewport"]').length > 0,
    internalLinks: $(`a[href^="/"], a[href*="${hostname}"]`).length,
    wordCount: $('body').text().trim().split(/\s+/).filter(Boolean).length,
    hasHttps: url.startsWith('https://'),
    responseTimeMs,
    finalUrl: response.url || url,
  };
}

type CrawlData = Awaited<ReturnType<typeof crawlPage>>;

// Step 3: Score based ONLY on real crawled data — no AI hallucination for scores
function calculateRealScores(data: CrawlData) {
  const scores: Record<string, number> = {};
  const issues: Array<{ severity: string; issue: string; detail: string; fix: string }> = [];
  const wins: string[] = [];

  // Title
  if (!data.title) {
    scores.title = 0;
    issues.push({ severity: 'critical', issue: 'Missing page title', detail: 'No <title> tag found. This is one of the most important on-page SEO factors.', fix: 'Add a descriptive title tag between 50–60 characters.' });
  } else if (data.title.length < 30) {
    scores.title = 40;
    issues.push({ severity: 'warning', issue: 'Title too short', detail: `Your title "${data.title.slice(0, 60)}" is only ${data.title.length} characters. Google prefers 50–60 characters.`, fix: 'Expand your title to include your main keyword and value proposition.' });
  } else if (data.title.length > 60) {
    scores.title = 70;
    issues.push({ severity: 'warning', issue: 'Title too long — may be truncated', detail: `Your title is ${data.title.length} characters. Google truncates titles over 60 characters in search results.`, fix: 'Shorten your title to under 60 characters. Keep the primary keyword near the start.' });
  } else {
    scores.title = 100;
    wins.push(`Title tag is ${data.title.length} characters — perfectly optimised`);
  }

  // Meta description
  if (!data.metaDescription) {
    scores.metaDescription = 0;
    issues.push({ severity: 'critical', issue: 'Missing meta description', detail: 'No meta description found. Google writes its own snippet, which is usually worse for CTR.', fix: 'Add a meta description between 120–155 characters including your primary keyword.' });
  } else if (data.metaDescription.length < 70) {
    scores.metaDescription = 50;
    issues.push({ severity: 'warning', issue: 'Meta description too short', detail: `Your description is only ${data.metaDescription.length} characters. Aim for 120–155 characters.`, fix: 'Expand your meta description to include a compelling value proposition and a call to action.' });
  } else if (data.metaDescription.length > 160) {
    scores.metaDescription = 65;
    issues.push({ severity: 'warning', issue: 'Meta description too long — will be cut off', detail: `Your description is ${data.metaDescription.length} characters. Google cuts off after ~155 characters.`, fix: 'Trim your meta description to 120–155 characters.' });
  } else {
    scores.metaDescription = 100;
    wins.push(`Meta description is ${data.metaDescription.length} characters — well optimised`);
  }

  // H1
  if (data.h1Tags.length === 0) {
    scores.h1 = 0;
    issues.push({ severity: 'critical', issue: 'No H1 heading found', detail: 'Your page has no H1 tag. Search engines use H1 to understand your main page topic.', fix: 'Add exactly one H1 tag containing your primary keyword.' });
  } else if (data.h1Tags.length > 1) {
    scores.h1 = 60;
    issues.push({ severity: 'warning', issue: `${data.h1Tags.length} H1 tags found — should be exactly 1`, detail: `Multiple H1s confuse search engines. Found: "${data.h1Tags.slice(0, 2).join('", "')}"`, fix: 'Keep one H1 with your main keyword. Convert others to H2 or H3.' });
  } else {
    scores.h1 = 100;
    wins.push(`H1 found: "${data.h1Tags[0].slice(0, 50)}${data.h1Tags[0].length > 50 ? '...' : ''}"`);
  }

  // HTTPS
  if (!data.hasHttps) {
    scores.https = 0;
    issues.push({ severity: 'critical', issue: 'Site not on HTTPS', detail: "Your site uses HTTP. Google confirmed HTTPS as a ranking factor. Chrome shows 'Not Secure' to users.", fix: "Install an SSL certificate. Most hosts offer free SSL via Let's Encrypt." });
  } else {
    scores.https = 100;
    wins.push('HTTPS enabled — secure connection confirmed');
  }

  // Speed
  if (data.responseTimeMs > 3000) {
    scores.speed = 20;
    issues.push({ severity: 'critical', issue: `Slow server response — ${(data.responseTimeMs / 1000).toFixed(1)}s`, detail: `Your server took ${(data.responseTimeMs / 1000).toFixed(1)}s to respond. Google recommends under 0.8s.`, fix: 'Check your hosting plan, enable caching, and consider a CDN like Cloudflare.' });
  } else if (data.responseTimeMs > 1500) {
    scores.speed = 55;
    issues.push({ severity: 'warning', issue: `Response time could be faster — ${(data.responseTimeMs / 1000).toFixed(1)}s`, detail: `Server responded in ${(data.responseTimeMs / 1000).toFixed(1)}s. Aim for under 0.8s for competitive rankings.`, fix: 'Enable browser caching, compress images, and consider upgrading your hosting.' });
  } else {
    scores.speed = 100;
    wins.push(`Fast server response — ${(data.responseTimeMs / 1000).toFixed(1)}s`);
  }

  // Images alt text
  if (data.imageCount > 0 && data.imagesWithoutAlt > 0) {
    const pct = Math.round((data.imagesWithoutAlt / data.imageCount) * 100);
    scores.imageAlt = Math.max(0, 100 - pct * 2);
    issues.push({ severity: data.imagesWithoutAlt > 5 ? 'critical' : 'warning', issue: `${data.imagesWithoutAlt} image${data.imagesWithoutAlt > 1 ? 's' : ''} missing alt text`, detail: `${data.imagesWithoutAlt} of ${data.imageCount} images have no alt attribute. Alt text helps Google understand images.`, fix: 'Add descriptive alt text to every image. Include your keyword naturally where relevant.' });
  } else if (data.imageCount > 0) {
    scores.imageAlt = 100;
    wins.push(`All ${data.imageCount} images have alt text`);
  } else {
    scores.imageAlt = 80;
  }

  // Canonical
  if (!data.hasCanonical) {
    scores.canonical = 30;
    issues.push({ severity: 'warning', issue: 'No canonical tag found', detail: 'Without a canonical tag, Google may index multiple versions of your page and split your ranking power.', fix: 'Add <link rel="canonical" href="your-page-url"> in the <head> of every page.' });
  } else {
    scores.canonical = 100;
    wins.push('Canonical tag present — prevents duplicate content issues');
  }

  // Schema
  if (!data.hasSchema) {
    scores.schema = 0;
    issues.push({ severity: 'warning', issue: 'No structured data (schema markup) found', detail: 'Schema markup helps Google display rich results (stars, FAQs, prices). Sites with rich results get significantly higher CTR.', fix: 'Add JSON-LD schema relevant to your business type (LocalBusiness, Product, Article, FAQ).' });
  } else {
    scores.schema = 100;
    wins.push('Structured data (schema markup) found — eligible for rich results');
  }

  // Mobile
  if (!data.hasViewport) {
    scores.mobile = 0;
    issues.push({ severity: 'critical', issue: 'Not mobile-friendly — missing viewport meta tag', detail: 'No viewport meta tag found. Google uses mobile-first indexing — mobile experience directly affects rankings.', fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.' });
  } else {
    scores.mobile = 100;
    wins.push('Mobile viewport tag present');
  }

  // Word count
  if (data.wordCount < 300) {
    scores.content = 20;
    issues.push({ severity: 'critical', issue: `Thin content — only ${data.wordCount} words`, detail: `Your page has only ${data.wordCount} words. Google considers pages under 300 words "thin content" and ranks them poorly.`, fix: 'Add at least 500–800 words of valuable, keyword-rich content.' });
  } else if (data.wordCount < 600) {
    scores.content = 60;
    issues.push({ severity: 'warning', issue: `Content could be more comprehensive — ${data.wordCount} words`, detail: `${data.wordCount} words is acceptable but competitors likely have more. Top-ranking pages average 1,200–1,500 words.`, fix: 'Expand your content with FAQs, case studies, or more detail on your key topics.' });
  } else {
    scores.content = 100;
    wins.push(`Good content length — ${data.wordCount} words`);
  }

  // Weighted overall score
  const weights: Record<string, number> = { title: 15, metaDescription: 12, h1: 15, https: 20, speed: 15, imageAlt: 8, canonical: 5, schema: 5, mobile: 15, content: 10 };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedScore = Object.entries(scores).reduce((acc, [key, score]) => acc + score * (weights[key] || 5), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  return { scores, overallScore, issues, wins };
}

// Step 4: AI personalised summary using REAL data only
async function generateActionPlan(data: CrawlData, overallScore: number, issues: Array<{ severity: string; issue: string; fix: string }>) {
  const topIssues = issues.filter(i => i.severity === 'critical').slice(0, 3).map(i => `- ${i.issue}: ${i.fix}`).join('\n');
  const prompt = `You are an expert SEO consultant reviewing a website audit.

Website: ${data.finalUrl}
Page Title: ${data.title || 'MISSING'}
Meta Description: ${data.metaDescription ? data.metaDescription.slice(0, 100) : 'MISSING'}
H1: ${data.h1Tags[0] || 'MISSING'}
Overall SEO Score: ${overallScore}/100
Word Count: ${data.wordCount}

Top critical issues found:
${topIssues || 'No critical issues found — site is well optimised'}

Write a 3-sentence personalised summary of this specific website's SEO situation. 
Be direct and specific — mention the actual page title and actual issues found.
Do NOT be generic. Do NOT mention scores you cannot verify.
End with one specific action the owner should take this week.
Keep it under 80 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });
    return response.choices[0].message.content || '';
  } catch {
    return `Your site scored ${overallScore}/100. ${topIssues ? 'We found critical issues that need immediate attention.' : 'Your site is well optimised.'} Sign up to get the full report and automated fixes.`;
  }
}

export async function POST(request: NextRequest) {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  const ip = vercelForwarded
    ? vercelForwarded.split(',').pop()?.trim() ?? 'unknown'
    : request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({
      rateLimited: true,
      signupUrl: '/signup',
      message: "You've used all 3 free audits today. Sign up free to continue.",
    }, { status: 429 });
  }

  let body: { url?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_request', message: 'Invalid JSON body' }, { status: 400 });
  }

  const rawUrl = (body.url || '').trim();
  if (!rawUrl) return NextResponse.json({ error: 'missing_url', message: 'Please provide a URL to audit.' }, { status: 400 });

  const normalised = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  // Step 1: Validate URL exists — reject fake/non-existent URLs
  const validation = await validateUrl(normalised);
  if (!validation.exists) {
    return NextResponse.json({
      error: 'site_not_found',
      message: "We couldn't reach this website. Please check the URL and try again.",
      checkedUrl: normalised,
    }, { status: 422 });
  }

  // Step 2: Crawl real HTML
  let crawledData: CrawlData;
  try {
    crawledData = await crawlPage(validation.finalUrl || normalised);
  } catch (err: unknown) {
    return NextResponse.json({
      error: 'crawl_failed',
      message: `We could reach the site but couldn't read its content. ${err instanceof Error ? err.message : ''}`,
    }, { status: 422 });
  }

  // Step 3: Score based on real data
  const { scores, overallScore, issues, wins } = calculateRealScores(crawledData);

  // Step 4: AI personalised summary
  const summary = await generateActionPlan(crawledData, overallScore, issues);

  const grade = overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'D';

  return NextResponse.json({
    success: true,
    url: crawledData.finalUrl,
    title: crawledData.title,
    overallScore,
    grade,
    summary,
    remaining,

    // 4 visible metrics (free)
    visibleMetrics: {
      https: { score: scores.https, label: 'HTTPS Security', detail: crawledData.hasHttps ? 'Secure connection confirmed' : 'Site is not using HTTPS' },
      title: { score: scores.title, label: 'Title Tag', detail: crawledData.title ? `"${crawledData.title.slice(0, 60)}${crawledData.title.length > 60 ? '...' : ''}" (${crawledData.title.length} chars)` : 'No title tag found' },
      metaDescription: { score: scores.metaDescription, label: 'Meta Description', detail: crawledData.metaDescription ? `${crawledData.metaDescription.length} characters` : 'No meta description found' },
      mobile: { score: scores.mobile, label: 'Mobile Friendly', detail: crawledData.hasViewport ? 'Viewport meta tag present' : 'Missing viewport meta tag' },
    },

    // 6 locked metrics (require signup)
    lockedMetrics: {
      speed: scores.speed,
      h1: scores.h1,
      imageAlt: scores.imageAlt,
      schema: scores.schema,
      canonical: scores.canonical,
      content: scores.content,
    },

    topIssues: issues.slice(0, 2),
    lockedIssueCount: Math.max(0, issues.length - 2),
    wins: wins.slice(0, 2),

    crawledAt: new Date().toISOString(),
    wordCount: crawledData.wordCount,
    imageCount: crawledData.imageCount,
    responseTimeMs: crawledData.responseTimeMs,
  });
}
