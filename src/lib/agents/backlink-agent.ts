/**
 * RankMind AI - Backlink Builder Agent (Growth Tier)
 * 
 * Performs REAL backlink building:
 * 1. Analyzes client website to understand niche and content
 * 2. Searches Google for real "write for us" and guest post opportunities
 * 3. Qualifies each opportunity (checks if site is real, accessible, relevant)
 * 4. Writes full SEO-optimized articles for each opportunity
 * 5. Generates personalized outreach emails
 * 6. Tracks everything and sends reports to client
 * 
 * Matches your twin.so BacklinkForge AI agent capabilities
 */

import { agentReason, agentWrite, googleSearch, fetchPageContent, sendEmail } from './core';

export interface BacklinkOpportunity {
  id: string;
  domain: string;
  url: string;
  title: string;
  type: 'guest_post' | 'resource_link' | 'broken_link' | 'niche_edit' | 'directory' | 'forum' | 'web2';
  estimated_da: number;
  niche_relevance: number;
  contact_email: string | null;
  contact_page: string | null;
  has_write_for_us: boolean;
  status: 'identified' | 'qualified' | 'article_written' | 'outreach_sent' | 'approved' | 'published' | 'rejected';
  article?: BacklinkArticle;
  outreach_email?: OutreachEmail;
  notes: string;
}

export interface BacklinkArticle {
  title: string;
  target_keyword: string;
  word_count: number;
  content: string;
  meta_description: string;
  internal_link_anchor: string;
  internal_link_url: string;
}

export interface OutreachEmail {
  subject: string;
  body: string;
  personalization_notes: string;
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
  status: 'running' | 'awaiting_approval' | 'completed';
  next_steps: string[];
}

/**
 * Step 1: Analyze client website to understand niche, keywords, and content
 */
async function analyzeClientSite(url: string): Promise<{
  niche: string;
  primary_keyword: string;
  secondary_keywords: string[];
  content_topics: string[];
  target_audience: string;
  unique_value_prop: string;
}> {
  const pageData = await fetchPageContent(url);

  return await agentReason(
    `You are an expert SEO strategist. Analyze this website and extract key information needed for a backlink building campaign.`,
    `Website URL: ${url}
    Title: ${pageData.title}
    Meta Description: ${pageData.metaDescription}
    H1: ${pageData.h1}
    H2s: ${pageData.h2s.join(' | ')}
    Content: ${pageData.bodyText.slice(0, 3000)}
    
    Return JSON:
    {
      "niche": "specific industry/niche (e.g., 'AI SEO Software', 'E-commerce Fashion', 'B2B SaaS')",
      "primary_keyword": "main keyword this site targets",
      "secondary_keywords": ["5 secondary keywords"],
      "content_topics": ["5 topics this site covers that could be guest post topics"],
      "target_audience": "who their customers are",
      "unique_value_prop": "what makes this site/product unique"
    }`
  );
}

/**
 * Step 2: Find real backlink opportunities via Google Search
 */
async function findOpportunities(
  niche: string,
  keywords: string[],
  count = 15
): Promise<Array<{ url: string; title: string; snippet: string; type: string }>> {
  const searchQueries = [
    `"write for us" ${niche}`,
    `"guest post" ${niche} "submit"`,
    `"contribute" ${keywords[0]} blog`,
    `"guest article" ${niche}`,
    `${niche} "write for us" OR "become a contributor"`,
    `intitle:"write for us" ${keywords[0]}`,
    `${niche} directory submit site`,
    `${keywords[0]} resource page "useful links"`,
  ];

  const allResults: Array<{ url: string; title: string; snippet: string; type: string }> = [];

  for (const query of searchQueries.slice(0, 4)) {
    try {
      const results = await googleSearch(query, 5);
      const typed = results.map(r => ({
        ...r,
        type: query.includes('directory') ? 'directory' :
              query.includes('resource') ? 'resource_link' : 'guest_post',
      }));
      allResults.push(...typed);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch {
      // Continue with other queries
    }
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  return allResults.filter(r => {
    try {
      const domain = new URL(r.url).hostname;
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch {
      return false;
    }
  }).slice(0, count);
}

/**
 * Step 3: Qualify each opportunity — check if it's real, accessible, and relevant
 */
async function qualifyOpportunity(
  result: { url: string; title: string; snippet: string; type: string },
  clientNiche: string
): Promise<BacklinkOpportunity | null> {
  try {
    const domain = new URL(result.url).hostname;

    // Skip obvious spam/low-quality sites
    const spamIndicators = ['spam', 'cheap', 'free-backlinks', 'linkfarm'];
    if (spamIndicators.some(s => domain.includes(s))) return null;

    // Fetch the page to check if it's real
    const pageData = await fetchPageContent(result.url);
    if (!pageData.title) return null; // Site not accessible

    // Use AI to qualify the opportunity
    const qualification = await agentReason<{
      is_relevant: boolean;
      estimated_da: number;
      niche_relevance: number;
      contact_email: string | null;
      has_write_for_us: boolean;
      opportunity_type: string;
      notes: string;
    }>(
      `You are an SEO link building expert. Evaluate if this website is a good backlink opportunity.`,
      `Client Niche: ${clientNiche}
      
      Opportunity Site:
      URL: ${result.url}
      Title: ${pageData.title}
      Description: ${pageData.metaDescription}
      Content: ${pageData.bodyText.slice(0, 1000)}
      
      Return JSON:
      {
        "is_relevant": true/false (is this site relevant to the client's niche?),
        "estimated_da": 1-100 (estimate domain authority based on site quality/age/content),
        "niche_relevance": 0-100 (how relevant is this site to the client's niche),
        "contact_email": "email if found in content or null",
        "has_write_for_us": true/false,
        "opportunity_type": "guest_post/resource_link/directory/niche_edit",
        "notes": "brief notes about this opportunity"
      }`
    );

    if (!qualification.is_relevant || qualification.niche_relevance < 40) return null;

    return {
      id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      domain,
      url: result.url,
      title: pageData.title,
      type: qualification.opportunity_type as BacklinkOpportunity['type'],
      estimated_da: qualification.estimated_da,
      niche_relevance: qualification.niche_relevance,
      contact_email: qualification.contact_email,
      contact_page: `${new URL(result.url).origin}/contact`,
      has_write_for_us: qualification.has_write_for_us,
      status: 'qualified',
      notes: qualification.notes,
    };
  } catch {
    return null;
  }
}

/**
 * Step 4: Write a full SEO-optimized article for a guest post opportunity
 */
async function writeGuestPostArticle(
  opportunity: BacklinkOpportunity,
  clientUrl: string,
  clientNiche: string,
  targetKeyword: string,
  uniqueValueProp: string
): Promise<BacklinkArticle> {
  // Generate article title and outline first
  const outline = await agentReason<{
    title: string;
    meta_description: string;
    target_keyword: string;
    sections: string[];
    anchor_text: string;
  }>(
    `You are an expert content writer specializing in SEO guest posts. Create an article outline that will be accepted by the target site and naturally include a backlink to the client's website.`,
    `Target Site: ${opportunity.domain} (${opportunity.title})
    Client Website: ${clientUrl}
    Client Niche: ${clientNiche}
    Client Value Prop: ${uniqueValueProp}
    Target Keyword: ${targetKeyword}
    
    Return JSON:
    {
      "title": "compelling article title (60-70 chars)",
      "meta_description": "meta description (150-160 chars)",
      "target_keyword": "primary keyword for this article",
      "sections": ["H2 section 1", "H2 section 2", "H2 section 3", "H2 section 4", "H2 section 5"],
      "anchor_text": "natural anchor text for the backlink to client site"
    }`
  );

  // Write the full article
  const articleContent = await agentWrite(
    `You are an expert SEO content writer. Write a high-quality, informative article that:
    1. Provides genuine value to readers
    2. Is optimized for the target keyword
    3. Naturally includes ONE backlink to the client's website using the specified anchor text
    4. Is 800-1200 words
    5. Uses proper H2/H3 structure
    6. Includes a compelling introduction and conclusion
    7. Sounds natural and human-written, not AI-generated
    
    Format the article in clean Markdown.`,
    `Article Title: ${outline.title}
    Target Keyword: ${outline.target_keyword}
    Sections to Cover: ${outline.sections.join(', ')}
    
    Client to Link To: ${clientUrl}
    Anchor Text for Backlink: "${outline.anchor_text}"
    Client Value Prop: ${uniqueValueProp}
    
    Write the complete article now. Include the backlink naturally in the body text.`,
    2500
  );

  return {
    title: outline.title,
    target_keyword: outline.target_keyword,
    word_count: articleContent.split(/\s+/).length,
    content: articleContent,
    meta_description: outline.meta_description,
    internal_link_anchor: outline.anchor_text,
    internal_link_url: clientUrl,
  };
}

/**
 * Step 5: Write a personalized outreach email
 */
async function writeOutreachEmail(
  opportunity: BacklinkOpportunity,
  article: BacklinkArticle,
  clientUrl: string,
  clientNiche: string
): Promise<OutreachEmail> {
  return await agentReason<OutreachEmail>(
    `You are an expert outreach specialist. Write a personalized, professional email to pitch a guest post to a website editor.
    
    The email must:
    - Be short (150-200 words max)
    - Sound human and genuine, not templated
    - Reference something specific about their site
    - Pitch the article topic clearly
    - Include a clear call to action
    - NOT be spammy or overly salesy`,
    `Target Site: ${opportunity.domain}
    Site Title: ${opportunity.title}
    Article Title: "${article.title}"
    Article Topic: ${article.target_keyword}
    Client Website: ${clientUrl}
    Client Niche: ${clientNiche}
    
    Return JSON:
    {
      "subject": "email subject line",
      "body": "full email body text",
      "personalization_notes": "what was personalized in this email"
    }`
  );
}

/**
 * Main function: Run the full Backlink Builder campaign
 */
export async function runBacklinkCampaign(
  clientUrl: string,
  targetCount = 10,
  clientEmail?: string,
  onProgress?: (step: string, data: unknown) => void
): Promise<BacklinkCampaign> {
  const campaignId = `camp_${Date.now()}`;

  onProgress?.('analyzing', { message: 'Analyzing your website...' });

  // Step 1: Analyze client site
  const clientAnalysis = await analyzeClientSite(clientUrl);

  onProgress?.('searching', { message: `Finding backlink opportunities in the ${clientAnalysis.niche} niche...` });

  // Step 2: Find opportunities
  const rawOpportunities = await findOpportunities(
    clientAnalysis.niche,
    [clientAnalysis.primary_keyword, ...clientAnalysis.secondary_keywords],
    targetCount * 2 // Find more than needed to account for filtering
  );

  onProgress?.('qualifying', { message: `Qualifying ${rawOpportunities.length} potential opportunities...` });

  // Step 3: Qualify opportunities (in parallel, max 5 at a time)
  const qualifiedOpportunities: BacklinkOpportunity[] = [];

  for (let i = 0; i < rawOpportunities.length && qualifiedOpportunities.length < targetCount; i += 3) {
    const batch = rawOpportunities.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(r => qualifyOpportunity(r, clientAnalysis.niche))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        qualifiedOpportunities.push(result.value);
      }
    }
  }

  onProgress?.('writing', { message: `Writing articles for ${qualifiedOpportunities.length} opportunities...` });

  // Step 4: Write articles for guest post opportunities (top 5)
  const guestPostOpps = qualifiedOpportunities
    .filter(o => o.type === 'guest_post' || o.has_write_for_us)
    .slice(0, 5);

  for (const opp of guestPostOpps) {
    try {
      const article = await writeGuestPostArticle(
        opp,
        clientUrl,
        clientAnalysis.niche,
        clientAnalysis.primary_keyword,
        clientAnalysis.unique_value_prop
      );
      opp.article = article;
      opp.status = 'article_written';

      // Write outreach email
      const outreachEmail = await writeOutreachEmail(
        opp,
        article,
        clientUrl,
        clientAnalysis.niche
      );
      opp.outreach_email = outreachEmail;

      onProgress?.('article_ready', { domain: opp.domain, title: article.title });
    } catch {
      opp.notes += ' | Article writing failed';
    }
  }

  // Step 5: Build campaign result
  const campaign: BacklinkCampaign = {
    campaign_id: campaignId,
    client_url: clientUrl,
    client_niche: clientAnalysis.niche,
    target_keywords: [clientAnalysis.primary_keyword, ...clientAnalysis.secondary_keywords.slice(0, 3)],
    opportunities: qualifiedOpportunities,
    articles_written: guestPostOpps.filter(o => o.article).length,
    outreach_sent: 0,
    links_secured: 0,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'awaiting_approval',
    next_steps: [
      `Review ${qualifiedOpportunities.length} qualified backlink opportunities`,
      `Approve articles for ${guestPostOpps.filter(o => o.article).length} guest post sites`,
      'Send outreach emails to approved opportunities',
      'Track responses and follow up after 5 days',
      'Schedule next campaign run in 2 weeks',
    ],
  };

  // Step 6: Send email report to client
  if (clientEmail) {
    await sendEmail({
      to: clientEmail,
      subject: `Backlink Campaign Ready: ${qualifiedOpportunities.length} opportunities found for ${clientUrl}`,
      html: generateCampaignEmailHTML(campaign),
    });
  }

  return campaign;
}

/**
 * Send approved outreach emails
 */
export async function sendOutreachEmails(
  campaign: BacklinkCampaign,
  approvedOpportunityIds: string[]
): Promise<{ sent: number; failed: number; results: Array<{ domain: string; success: boolean }> }> {
  let sent = 0;
  let failed = 0;
  const results: Array<{ domain: string; success: boolean }> = [];

  for (const opp of campaign.opportunities) {
    if (!approvedOpportunityIds.includes(opp.id)) continue;
    if (!opp.outreach_email || !opp.contact_email) continue;

    const emailResult = await sendEmail({
      to: opp.contact_email,
      subject: opp.outreach_email.subject,
      html: `<pre style="font-family: Arial; white-space: pre-wrap;">${opp.outreach_email.body}</pre>`,
    });

    if (emailResult.success) {
      sent++;
      opp.status = 'outreach_sent';
      results.push({ domain: opp.domain, success: true });
    } else {
      failed++;
      results.push({ domain: opp.domain, success: false });
    }

    // Delay between emails to avoid spam filters
    await new Promise(r => setTimeout(r, 2000));
  }

  return { sent, failed, results };
}

function generateCampaignEmailHTML(campaign: BacklinkCampaign): string {
  const guestPosts = campaign.opportunities.filter(o => o.article);

  return `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e0e0e0; }
      .header { background: linear-gradient(135deg, #10b981, #6366f1); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .stat { display: inline-block; margin: 10px; text-align: center; }
      .stat-num { font-size: 36px; font-weight: bold; color: white; }
      .section { background: #1a1a1a; padding: 20px; margin: 10px 0; border-radius: 8px; border: 1px solid #333; }
      .opp { padding: 12px 0; border-bottom: 1px solid #333; }
      h2 { color: #10b981; } h3 { color: #6366f1; }
      .badge { background: #6366f1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    </style></head>
    <body>
      <div class="header">
        <h1 style="color:white; margin:0">Backlink Campaign Ready!</h1>
        <p style="color:rgba(255,255,255,0.8)">${campaign.client_url}</p>
        <div>
          <div class="stat"><div class="stat-num">${campaign.opportunities.length}</div><div>Opportunities</div></div>
          <div class="stat"><div class="stat-num">${campaign.articles_written}</div><div>Articles Written</div></div>
        </div>
      </div>
      
      <div class="section">
        <h2>Qualified Opportunities</h2>
        ${campaign.opportunities.slice(0, 8).map(o => `
          <div class="opp">
            <strong>${o.domain}</strong> <span class="badge">DA ~${o.estimated_da}</span>
            <span class="badge">${o.type.replace('_', ' ')}</span>
            <br><small style="color:#888">${o.notes}</small>
          </div>
        `).join('')}
      </div>
      
      ${guestPosts.length > 0 ? `
      <div class="section">
        <h2>Articles Written & Ready</h2>
        ${guestPosts.map(o => `
          <div class="opp">
            <strong>${o.article?.title}</strong>
            <br><small>For: ${o.domain} | ${o.article?.word_count} words | Keyword: ${o.article?.target_keyword}</small>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="section">
        <h2>Next Steps</h2>
        ${campaign.next_steps.map((s, i) => `<div class="opp">${i + 1}. ${s}</div>`).join('')}
      </div>
      
      <div style="text-align:center; padding: 20px; color: #666;">
        <p>Powered by <strong>RankMind AI</strong> — Real SEO, Real Results</p>
        <a href="https://rankmind-ai.vercel.app/dashboard/backlinks" style="color:#10b981">Review & Approve in Dashboard →</a>
      </div>
    </body>
    </html>
  `;
}
