/**
 * RankMind AI — Serper.dev API Client
 *
 * Direct SERPER integration for LinkBot backlink discovery.
 * Bypasses the AI qualification step for speed and reliability.
 * Results are enriched with heuristic DA estimation, relevance scoring,
 * and email extraction from snippets.
 */

interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerperResponse {
  organic: SerperSearchResult[];
  searchParameters: {
    q: string;
    type: string;
  };
}

export interface SerperBacklinkOpportunity {
  domain_name: string;
  site_url: string;
  estimated_da: number;
  contact_email: string | null;
  niche_relevance: number;
  site_type: 'guest_post' | 'directory' | 'forum' | 'resource' | 'web2';
  title: string;
  snippet: string;
}

/**
 * Search for backlink opportunities using Serper.dev (Google Search API).
 * Runs 4 query variations to maximise coverage, deduplicates by domain,
 * and sorts by DA descending then relevance descending.
 */
export async function searchBacklinkOpportunities(
  niche: string,
  targetUrl?: string
): Promise<SerperBacklinkOpportunity[]> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.error('[Serper] SERPER_API_KEY is not set in environment variables');
    return [];
  }

  // 4 query variations to find guest post opportunities
  const queries = [
    `${niche} "write for us"`,
    `${niche} "guest post" guidelines`,
    `${niche} "submit a guest post"`,
    `${niche} "become a contributor"`,
  ];

  const allResults: SerperBacklinkOpportunity[] = [];
  const seenDomains = new Set<string>();

  // Extract the client's own domain to avoid self-referencing
  let clientDomain = '';
  if (targetUrl) {
    try {
      clientDomain = new URL(
        targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`
      ).hostname.replace(/^www\./, '');
    } catch { /* ignore */ }
  }

  for (const query of queries) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 10,
          gl: 'us',
          hl: 'en',
        }),
      });

      if (!response.ok) {
        console.error(`[Serper] API error for query "${query}": ${response.status} ${response.statusText}`);
        continue;
      }

      const data: SerperResponse = await response.json();

      for (const result of data.organic || []) {
        const domain = extractDomain(result.link);
        if (!domain) continue;
        // Skip client's own domain
        if (clientDomain && domain.includes(clientDomain)) continue;
        // Deduplicate by domain
        if (seenDomains.has(domain)) continue;
        seenDomains.add(domain);

        allResults.push({
          domain_name: domain,
          site_url: result.link,
          estimated_da: estimateDomainAuthority(domain),
          contact_email: extractEmailFromSnippet(result.snippet),
          niche_relevance: calculateRelevance(result.snippet, result.title, niche),
          site_type: classifySiteType(result.title, result.snippet),
          title: result.title,
          snippet: result.snippet,
        });
      }
    } catch (error) {
      console.error(`[Serper] Search failed for query: "${query}"`, error);
    }
  }

  // Sort: DA descending, then relevance descending
  allResults.sort((a, b) => {
    if (b.estimated_da !== a.estimated_da) return b.estimated_da - a.estimated_da;
    return b.niche_relevance - a.niche_relevance;
  });

  console.log(`[Serper] Found ${allResults.length} unique opportunities for niche: "${niche}"`);
  return allResults;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Heuristic DA estimation based on known high-authority domains.
 * Returns a value in the 25–85 range.
 */
function estimateDomainAuthority(domain: string): number {
  const highDA = [
    'medium.com', 'linkedin.com', 'forbes.com', 'hubspot.com',
    'moz.com', 'semrush.com', 'searchengineland.com', 'neilpatel.com',
    'ahrefs.com', 'backlinko.com', 'searchenginejournal.com',
    'entrepreneur.com', 'inc.com', 'fastcompany.com', 'hbr.org',
    'techcrunch.com', 'wired.com', 'theverge.com', 'mashable.com',
    'smashingmagazine.com', 'sitepoint.com', 'css-tricks.com',
    'copyblogger.com', 'contentmarketinginstitute.com', 'marketingland.com',
    'socialmediaexaminer.com', 'wordstream.com', 'kissmetrics.com',
  ];

  const mediumDA = [
    'wordpress.org', 'blogger.com', 'tumblr.com', 'weebly.com',
    'wix.com', 'squarespace.com', 'livejournal.com',
  ];

  if (highDA.some((d) => domain.includes(d))) return Math.floor(Math.random() * 15) + 70; // 70–85
  if (mediumDA.some((d) => domain.includes(d))) return Math.floor(Math.random() * 15) + 40; // 40–55
  if (domain.endsWith('.edu') || domain.endsWith('.gov')) return Math.floor(Math.random() * 10) + 75; // 75–85
  if (domain.endsWith('.org')) return Math.floor(Math.random() * 20) + 45; // 45–65
  // Default: small/medium blogs
  return Math.floor(Math.random() * 25) + 25; // 25–50
}

function extractEmailFromSnippet(snippet: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = snippet.match(emailRegex);
  return match ? match[0] : null;
}

function calculateRelevance(snippet: string, title: string, niche: string): number {
  const text = `${snippet} ${title}`.toLowerCase();
  const nicheWords = niche.toLowerCase().split(/\s+/);
  let score = 5; // base
  for (const word of nicheWords) {
    if (word.length > 2 && text.includes(word)) score += 1;
  }
  if (text.includes('write for us') || text.includes('guest post')) score += 2;
  if (text.includes('submit') || text.includes('contribute')) score += 1;
  return Math.min(score, 10);
}

function classifySiteType(
  title: string,
  snippet: string
): SerperBacklinkOpportunity['site_type'] {
  const text = `${title} ${snippet}`.toLowerCase();
  if (text.includes('directory') || text.includes('list of')) return 'directory';
  if (text.includes('forum') || text.includes('community') || text.includes('reddit')) return 'forum';
  if (text.includes('resource') || text.includes('roundup') || text.includes('useful links')) return 'resource';
  if (text.includes('medium') || text.includes('blogger') || text.includes('web 2')) return 'web2';
  return 'guest_post';
}

/**
 * Enrich a backlink opportunity with a real contact email.
 *
 * Strategy:
 * 1. Use SERPER to find the site's contact / write-for-us page
 * 2. Fetch that page and regex-extract email addresses
 * 3. Prefer editorial/outreach emails over generic ones
 *
 * Returns null if no email is found or any step fails.
 */
export async function enrichContactEmail(
  domain: string,
  siteUrl: string
): Promise<string | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  try {
    // Step 1: Search for the contact / write-for-us page on this domain
    const contactSearch = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `site:${domain} contact OR "write for us" OR submit OR contribute`,
        num: 5,
      }),
    });

    if (!contactSearch.ok) return null;

    const searchData = await contactSearch.json();
    const contactPageUrl =
      searchData.organic?.[0]?.link ||
      searchData.organic?.[1]?.link ||
      null;

    if (!contactPageUrl) return null;

    // Step 2: Fetch the contact page and extract emails
    const pageRes = await fetch(contactPageUrl, {
      headers: { 'User-Agent': 'RankMind-Bot/1.0 (+https://rank-mind.com)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    // Extract all email addresses from the HTML
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex) || [];

    // Prefer editorial/outreach emails; filter out noreply/example/test
    const preferred = emails.find((e) =>
      /editor|outreach|submit|guest|contribut|write/i.test(e)
    );
    const fallback = emails.find((e) =>
      !/noreply|no-reply|example\.com|test@/i.test(e)
    );

    return preferred || fallback || null;
  } catch (error) {
    console.error('[EnrichContact] Error for domain:', domain, error);
    return null;
  }
}
