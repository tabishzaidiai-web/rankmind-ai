/**
 * RankMind AI - Backlink Builder Agent (Growth Tier)
 *
 * Fast version: Analyze site + find prospects + qualify + write outreach emails
 * All in one pass, optimized to complete within Vercel's 60s limit.
 */
import { agentReason, googleSearch, fetchPageContent, sendEmail } from './core';

export interface BacklinkOpportunity {
  id: string;
  domain: string;
  url: string;
  title: string;
  type: 'guest_post' | 'resource_link' | 'directory' | 'forum' | 'web2';
  estimated_da: number;
  niche_relevance: number;
  contact_email: string | null;
  contact_page: string | null;
  has_write_for_us: boolean;
  status: 'identified' | 'qualified' | 'outreach_sent';
  outreach_email?: { subject: string; body: string };
  notes: string;
}

export interface BacklinkCampaign {
  campaign_id: string;
  client_url: string;
  client_niche: string;
  target_keywords: string[];
  opportunities: BacklinkOpportunity[];
  articles_written: number;
  outreach_sent: number;
  links_secured: number;
  started_at: string;
  updated_at: string;
  status: 'completed';
  next_steps: string[];
}

async function analyzeClientSite(url: string) {
  const pageData = await fetchPageContent(url);
  return await agentReason<{
    niche: string;
    primary_keyword: string;
    secondary_keywords: string[];
    unique_value_prop: string;
  }>(
    'You are an SEO strategist. Analyze this website for a backlink campaign. Return ONLY valid JSON.',
    `URL: ${url}
Title: ${pageData.title}
Meta: ${pageData.metaDescription}
H1: ${pageData.h1}
Content: ${pageData.bodyText.slice(0, 1500)}
Return: { "niche": "...", "primary_keyword": "...", "secondary_keywords": ["k1","k2","k3"], "unique_value_prop": "..." }`
  );
}

// Domains that are never useful as backlink prospects
const BLOCKED_DOMAINS = new Set([
  'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
  'linkedin.com', 'pinterest.com', 'reddit.com', 'tiktok.com', 'snapchat.com',
  'wikipedia.org', 'amazon.com', 'ebay.com', 'google.com', 'bing.com',
  'yahoo.com', 'quora.com', 'medium.com', 'substack.com',
]);

async function findAndQualifyOpportunities(
  niche: string,
  keyword: string,
  clientDomain?: string
): Promise<BacklinkOpportunity[]> {
  // Validate Serper API key before making any calls
  if (!process.env.SERPER_API_KEY) {
    throw new Error(
      'SERPER_API_KEY is not configured. Add it to your Vercel environment variables. ' +
      'Get a free key at https://serper.dev (2,500 free queries included).'
    );
  }

  // 6 query types as specified: guest posts, resource pages, competitor backlinks, directories
  const queries = [
    // Guest post opportunities
    `${niche} "write for us"`,
    `${niche} "guest post"`,
    `${niche} "submit a post"`,
    // Resource pages
    `${niche} "useful links"`,
    `${niche} "resources"`,
    // Niche directories
    `${niche} directory site:*.com`,
  ];

  console.log('[LinkBot] Starting Serper search for niche:', niche, '| keyword:', keyword);
  console.log('[LinkBot] Running', queries.length, 'queries via Serper API');

  const allResults: Array<{ url: string; title: string; snippet: string }> = [];
  const searchPromises = queries.map(async (query) => {
    try {
      const results = await googleSearch(query, 10);
      console.log(`[LinkBot] Query "${query}" → ${results.length} results`);
      return results;
    } catch (err) {
      console.error(`[LinkBot] Query failed: "${query}"`, err instanceof Error ? err.message : err);
      return [];
    }
  });

  const settled = await Promise.all(searchPromises);
  settled.forEach(r => allResults.push(...r));
  console.log('[LinkBot] Total raw results:', allResults.length);

  // Filter: remove blocked domains, social media, and the client's own domain
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (!r.url) return false;
    try {
      const hostname = new URL(r.url).hostname.replace(/^www\./, '');
      // Skip blocked domains
      if (BLOCKED_DOMAINS.has(hostname)) return false;
      // Skip client's own domain
      if (clientDomain && hostname.includes(clientDomain.replace(/^www\./, ''))) return false;
      // Deduplicate by domain
      if (seen.has(hostname)) return false;
      seen.add(hostname);
      return true;
    } catch { return false; }
  }).slice(0, 20);

  console.log('[LinkBot] Unique filtered prospects:', unique.length);

  if (unique.length === 0) {
    throw new Error(
      `No backlink prospects found for "${niche}". ` +
      `Try a broader niche keyword (e.g. "digital marketing" instead of a very specific phrase). ` +
      `If the problem persists, verify your SERPER_API_KEY is set correctly in Vercel environment variables.`
    );
  }

  // Qualify all at once with a single AI call
  const qualified = await agentReason<{
    opportunities: Array<{
      url: string;
      domain: string;
      title: string;
      type: string;
      estimated_da: number;
      niche_relevance: number;
      has_write_for_us: boolean;
      contact_email: string | null;
      notes: string;
    }>;
  }>(
    'You are an SEO backlink specialist. Score these websites as backlink opportunities. Return ONLY valid JSON.',
    `Niche: ${niche} | Keyword: ${keyword}

Sites:
${unique.map((r, i) => `${i + 1}. ${r.url} | ${r.title} | ${r.snippet}`).join('\n')}

For each site estimate estimated_da (1-100), niche_relevance (1-10), type (guest_post/resource_link/directory/web2), has_write_for_us, contact_email (extract from snippet or null), notes.
Only include sites with niche_relevance >= 5 and estimated_da >= 20. Max 8 results.
Return: { "opportunities": [...] }`
  );

  return (qualified.opportunities || []).map((opp, i) => ({
    id: `opp_${i + 1}`,
    domain: opp.domain || (() => { try { return new URL(opp.url).hostname; } catch { return opp.url; } })(),
    url: opp.url,
    title: opp.title,
    type: (opp.type as BacklinkOpportunity['type']) || 'guest_post',
    estimated_da: opp.estimated_da || 30,
    niche_relevance: opp.niche_relevance || 5,
    contact_email: opp.contact_email,
    contact_page: opp.has_write_for_us ? opp.url : null,
    has_write_for_us: opp.has_write_for_us,
    status: 'qualified' as const,
    notes: opp.notes || '',
  }));
}

async function writeOutreachEmails(
  opportunities: BacklinkOpportunity[],
  clientUrl: string,
  niche: string,
  valueProp: string
): Promise<BacklinkOpportunity[]> {
  const top = opportunities.slice(0, 5);
  const result = await agentReason<{
    emails: Array<{ url: string; subject: string; body: string }>;
  }>(
    'You are an outreach specialist. Write short, personal guest post pitch emails. Return ONLY valid JSON.',
    `Client: ${clientUrl} | Niche: ${niche} | Value: ${valueProp}

Sites:
${top.map((o, i) => `${i + 1}. ${o.domain} (DA ${o.estimated_da})`).join('\n')}

Write a 150-word personalized pitch email for each. Be natural, not spammy.
Return: { "emails": [{ "url": "...", "subject": "...", "body": "..." }] }`
  );

  const emailMap = new Map((result.emails || []).map((e) => [e.url, e]));

  return opportunities.map((opp) => {
    const email = emailMap.get(opp.url);
    return {
      ...opp,
      outreach_email: email ? { subject: email.subject, body: email.body } : undefined,
      status: email ? ('outreach_sent' as const) : opp.status,
    };
  });
}

export async function runBacklinkCampaign(
  clientUrl: string,
  targetCount = 8,
  clientEmail?: string,
  nicheOverride?: string
): Promise<BacklinkCampaign> {
  const analysis = await analyzeClientSite(clientUrl);
  // Use the niche from the form if provided — it's more accurate than AI inference
  const effectiveNiche = (nicheOverride && nicheOverride.trim().length > 2) ? nicheOverride.trim() : analysis.niche;
  // Extract client domain for filtering (don't return the client's own site as a prospect)
  let clientDomain: string | undefined;
  try { clientDomain = new URL(clientUrl).hostname; } catch { clientDomain = undefined; }
  console.log('[LinkBot] Effective niche:', effectiveNiche, '| primary keyword:', analysis.primary_keyword, '| client domain:', clientDomain);
  const opps = await findAndQualifyOpportunities(effectiveNiche, analysis.primary_keyword, clientDomain);
  const oppsWithEmails = await writeOutreachEmails(opps, clientUrl, analysis.niche, analysis.unique_value_prop);

  const campaign: BacklinkCampaign = {
    campaign_id: `camp_${Date.now()}`,
    client_url: clientUrl,
    client_niche: analysis.niche,
    target_keywords: [analysis.primary_keyword, ...analysis.secondary_keywords],
    opportunities: oppsWithEmails,
    articles_written: 0,
    outreach_sent: oppsWithEmails.filter((o) => o.outreach_email).length,
    links_secured: 0,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'completed',
    next_steps: [
      `Send outreach emails to ${oppsWithEmails.filter((o) => o.outreach_email).length} qualified sites`,
      'Follow up after 5-7 days if no response',
      'Submit guest post articles once sites approve',
      `Target: ${analysis.primary_keyword} backlinks from DA 20+ sites`,
    ],
  };

  if (clientEmail) {
    await sendEmail({
      to: clientEmail,
      subject: `Backlink Campaign Ready: ${oppsWithEmails.length} opportunities found for ${clientUrl}`,
      html: generateEmailHTML(campaign),
    });
  }

  return campaign;
}

function generateEmailHTML(c: BacklinkCampaign): string {
  return `<!DOCTYPE html><html><head><style>
body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#e0e0e0}
.header{background:linear-gradient(135deg,#0d9488,#2563eb);padding:30px;text-align:center;border-radius:8px 8px 0 0}
.count{font-size:56px;font-weight:bold;color:white}
.section{background:#1a1a1a;padding:20px;margin:10px 0;border-radius:8px;border:1px solid #333}
.opp{padding:10px 0;border-bottom:1px solid #333}
.da{background:#0d9488;color:white;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold}
h2{color:#0d9488}a{color:#0d9488}
</style></head><body>
<div class="header">
  <div class="count">${c.opportunities.length}</div>
  <p style="color:rgba(255,255,255,0.9);font-size:18px;margin:0">Backlink Opportunities Found</p>
  <p style="color:rgba(255,255,255,0.6);font-size:14px">${c.client_url} &bull; ${c.client_niche}</p>
</div>
<div class="section">
  <h2>Top Opportunities</h2>
  ${c.opportunities.slice(0, 8).map(o => `
  <div class="opp">
    <strong><a href="${o.url}">${o.domain}</a></strong> <span class="da">DA ${o.estimated_da}</span>
    <span style="color:#666;font-size:12px;margin-left:8px">${o.type.replace('_',' ')}</span>
    <div style="color:#888;font-size:13px;margin-top:4px">Relevance: ${o.niche_relevance}/10 &bull; ${o.notes}</div>
    ${o.contact_email ? `<div style="color:#0d9488;font-size:12px">Contact: ${o.contact_email}</div>` : ''}
  </div>`).join('')}
</div>
<div class="section">
  <h2>Next Steps</h2>
  ${c.next_steps.map(s => `<div style="padding:6px 0;border-bottom:1px solid #333">→ ${s}</div>`).join('')}
</div>
<div style="text-align:center;padding:20px;color:#666">
  <p>Powered by <strong>RankMind AI</strong></p>
  <a href="https://www.rank-mind.com/dashboard/backlinks">View Full Dashboard</a>
</div>
</body></html>`;
}
