/**
 * RankMind AI - GEO Optimizer + Content Writer Agent (Enterprise Tier)
 * 
 * GEO = Generative Engine Optimization — optimizing for AI search engines:
 * ChatGPT, Perplexity, Google SGE, Claude, Gemini
 * 
 * This agent:
 * 1. Analyzes how AI search engines currently describe the client's website
 * 2. Identifies gaps between current content and what AI engines want to see
 * 3. Writes weekly SEO blog posts optimized for both traditional and AI search
 * 4. Creates FAQ schemas and structured data recommendations
 * 5. Builds topical authority clusters
 * 6. Sends weekly content reports
 */

import { agentReason, agentWrite, googleSearch, fetchPageContent, sendEmail } from './core';

export interface GEOAnalysis {
  url: string;
  analyzed_at: string;
  geo_score: number;
  ai_visibility: AIVisibility;
  content_gaps: ContentGap[];
  schema_recommendations: SchemaRecommendation[];
  topical_authority: TopicalAuthority;
  weekly_content_plan: ContentPiece[];
  action_plan: GEOAction[];
}

export interface AIVisibility {
  score: number;
  chatgpt_optimized: boolean;
  perplexity_optimized: boolean;
  google_sge_optimized: boolean;
  issues: string[];
  strengths: string[];
}

export interface ContentGap {
  topic: string;
  search_intent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  ai_search_volume: 'high' | 'medium' | 'low';
  priority: number;
  recommended_format: 'blog_post' | 'faq' | 'how_to' | 'comparison' | 'listicle';
}

export interface SchemaRecommendation {
  type: string;
  priority: 'critical' | 'high' | 'medium';
  description: string;
  implementation: string;
}

export interface TopicalAuthority {
  current_score: number;
  target_score: number;
  main_topic: string;
  subtopics_covered: string[];
  subtopics_missing: string[];
  content_cluster_plan: string[];
}

export interface ContentPiece {
  title: string;
  type: 'blog_post' | 'faq' | 'how_to' | 'comparison' | 'listicle';
  target_keyword: string;
  ai_search_intent: string;
  estimated_word_count: number;
  priority: number;
  content?: string;
  meta_description?: string;
  schema_markup?: string;
}

export interface GEOAction {
  action: string;
  category: 'schema' | 'content' | 'technical' | 'authority';
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

/**
 * Run full GEO Analysis on a website
 */
export async function runGEOAnalysis(url: string): Promise<GEOAnalysis> {
  const pageData = await fetchPageContent(url);

  // Check how the site appears in AI-related searches
  let competitorInsights: Array<{ title: string; url: string; snippet: string }> = [];
  try {
    const domain = new URL(url).hostname;
    competitorInsights = await googleSearch(`${pageData.title} site:${domain}`, 5);
  } catch {
    // Continue without competitor data
  }

  const analysis = await agentReason<{
    geo_score: number;
    chatgpt_optimized: boolean;
    perplexity_optimized: boolean;
    google_sge_optimized: boolean;
    ai_visibility_issues: string[];
    ai_visibility_strengths: string[];
    content_gaps: Array<{
      topic: string;
      search_intent: string;
      ai_search_volume: string;
      priority: number;
      recommended_format: string;
    }>;
    schema_recommendations: Array<{
      type: string;
      priority: string;
      description: string;
      implementation: string;
    }>;
    main_topic: string;
    subtopics_covered: string[];
    subtopics_missing: string[];
    content_cluster_plan: string[];
    weekly_content_titles: Array<{
      title: string;
      type: string;
      target_keyword: string;
      ai_search_intent: string;
      estimated_word_count: number;
      priority: number;
    }>;
    action_plan: Array<{
      action: string;
      category: string;
      impact: string;
      implementation: string;
    }>;
  }>(
    `You are an expert in Generative Engine Optimization (GEO) — the practice of optimizing websites to appear in AI-generated search results from ChatGPT, Perplexity, Google SGE, and similar AI search engines.
    
    Analyze the provided website and give comprehensive GEO recommendations. Focus on:
    - Structured data and schema markup
    - Content clarity and direct answers (AI engines prefer clear, factual answers)
    - Topical authority and content depth
    - FAQ sections and Q&A format content
    - E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
    - Citation-worthy content (statistics, research, unique insights)`,
    `Website URL: ${url}
    Title: ${pageData.title}
    Meta Description: ${pageData.metaDescription}
    H1: ${pageData.h1}
    H2s: ${pageData.h2s.join(' | ')}
    Word Count: ${pageData.wordCount}
    Content: ${pageData.bodyText.slice(0, 3000)}
    
    Return comprehensive JSON analysis with all fields specified.
    
    Return JSON:
    {
      "geo_score": 0-100,
      "chatgpt_optimized": true/false,
      "perplexity_optimized": true/false,
      "google_sge_optimized": true/false,
      "ai_visibility_issues": ["list of issues preventing AI engine visibility"],
      "ai_visibility_strengths": ["list of existing strengths"],
      "content_gaps": [
        {
          "topic": "specific topic to cover",
          "search_intent": "informational/commercial/navigational/transactional",
          "ai_search_volume": "high/medium/low",
          "priority": 1-10,
          "recommended_format": "blog_post/faq/how_to/comparison/listicle"
        }
      ],
      "schema_recommendations": [
        {
          "type": "schema type (e.g., FAQPage, HowTo, Article)",
          "priority": "critical/high/medium",
          "description": "why this schema is needed",
          "implementation": "brief implementation guide"
        }
      ],
      "main_topic": "the main topic this site covers",
      "subtopics_covered": ["topics already covered well"],
      "subtopics_missing": ["important subtopics not yet covered"],
      "content_cluster_plan": ["5 content cluster articles to write"],
      "weekly_content_titles": [
        {
          "title": "article title",
          "type": "blog_post/faq/how_to/comparison/listicle",
          "target_keyword": "primary keyword",
          "ai_search_intent": "what AI users are searching for",
          "estimated_word_count": 800-2000,
          "priority": 1-5
        }
      ],
      "action_plan": [
        {
          "action": "specific action to take",
          "category": "schema/content/technical/authority",
          "impact": "high/medium/low",
          "implementation": "how to implement this"
        }
      ]
    }`
  );

  const currentScore = analysis.geo_score;

  return {
    url,
    analyzed_at: new Date().toISOString(),
    geo_score: currentScore,
    ai_visibility: {
      score: currentScore,
      chatgpt_optimized: analysis.chatgpt_optimized,
      perplexity_optimized: analysis.perplexity_optimized,
      google_sge_optimized: analysis.google_sge_optimized,
      issues: analysis.ai_visibility_issues,
      strengths: analysis.ai_visibility_strengths,
    },
    content_gaps: analysis.content_gaps.map(g => ({
      topic: g.topic,
      search_intent: g.search_intent as ContentGap['search_intent'],
      ai_search_volume: g.ai_search_volume as ContentGap['ai_search_volume'],
      priority: g.priority,
      recommended_format: g.recommended_format as ContentGap['recommended_format'],
    })),
    schema_recommendations: analysis.schema_recommendations.map(s => ({
      type: s.type,
      priority: s.priority as SchemaRecommendation['priority'],
      description: s.description,
      implementation: s.implementation,
    })),
    topical_authority: {
      current_score: Math.round(currentScore * 0.8),
      target_score: 85,
      main_topic: analysis.main_topic,
      subtopics_covered: analysis.subtopics_covered,
      subtopics_missing: analysis.subtopics_missing,
      content_cluster_plan: analysis.content_cluster_plan,
    },
    weekly_content_plan: analysis.weekly_content_titles.map(c => ({
      title: c.title,
      type: c.type as ContentPiece['type'],
      target_keyword: c.target_keyword,
      ai_search_intent: c.ai_search_intent,
      estimated_word_count: c.estimated_word_count,
      priority: c.priority,
    })),
    action_plan: analysis.action_plan.map(a => ({
      action: a.action,
      category: a.category as GEOAction['category'],
      impact: a.impact as GEOAction['impact'],
      implementation: a.implementation,
    })),
  };
}

/**
 * Write a full SEO + GEO optimized blog post
 */
export async function writeOptimizedContent(
  contentPiece: ContentPiece,
  siteUrl: string,
  siteNiche: string
): Promise<ContentPiece> {
  // Write the full article
  const content = await agentWrite(
    `You are an expert SEO and GEO content writer. Write content that:
    1. Answers questions directly and clearly (AI search engines prefer direct answers)
    2. Uses structured headings (H2, H3) for easy scanning
    3. Includes statistics, facts, and specific examples
    4. Has a clear FAQ section at the end (helps with AI search visibility)
    5. Is optimized for the target keyword naturally
    6. Includes internal linking opportunities
    7. Demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, Trust)
    8. Is 100% unique and valuable to readers
    
    Format in clean Markdown. Include a JSON-LD schema markup at the end.`,
    `Write a ${contentPiece.type} article:
    
    Title: ${contentPiece.title}
    Target Keyword: ${contentPiece.target_keyword}
    AI Search Intent: ${contentPiece.ai_search_intent}
    Target Word Count: ${contentPiece.estimated_word_count}
    Website: ${siteUrl}
    Niche: ${siteNiche}
    
    Requirements:
    - Start with a compelling introduction that directly answers the main question
    - Use H2 and H3 headings throughout
    - Include at least 3 specific statistics or data points
    - Add a FAQ section with 5 questions and direct answers
    - End with a clear conclusion and CTA
    - Add JSON-LD schema markup at the very end`,
    3000
  );

  // Generate meta description
  const metaDescription = await agentWrite(
    'Write a compelling meta description of exactly 150-160 characters for this article. Include the target keyword naturally.',
    `Article Title: ${contentPiece.title}\nTarget Keyword: ${contentPiece.target_keyword}\nContent Preview: ${content.slice(0, 500)}`,
    100
  );

  return {
    ...contentPiece,
    content,
    meta_description: metaDescription.trim(),
  };
}

/**
 * Generate FAQ schema markup for a page
 */
export async function generateFAQSchema(url: string, topic: string): Promise<string> {
  const pageData = await fetchPageContent(url);

  const faqs = await agentReason<{
    questions: Array<{ question: string; answer: string }>;
  }>(
    `Generate 8-10 FAQ questions and answers for a webpage. The FAQs should:
    - Answer real questions people ask AI search engines about this topic
    - Be specific and informative (not generic)
    - Include the target keyword naturally
    - Be formatted for FAQPage schema markup`,
    `Website: ${url}
    Topic: ${topic}
    Page Title: ${pageData.title}
    Content: ${pageData.bodyText.slice(0, 2000)}
    
    Return JSON: { "questions": [{"question": "...", "answer": "..."}] }`
  );

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.questions.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(schemaMarkup, null, 2);
}

/**
 * Send weekly GEO + Content report to client
 */
export async function sendWeeklyContentReport(
  clientEmail: string,
  clientUrl: string,
  geoAnalysis: GEOAnalysis,
  contentWritten: ContentPiece[]
): Promise<void> {
  await sendEmail({
    to: clientEmail,
    subject: `Weekly SEO Report: GEO Score ${geoAnalysis.geo_score}/100 | ${contentWritten.length} articles ready`,
    html: generateWeeklyReportHTML(clientUrl, geoAnalysis, contentWritten),
  });
}

function generateWeeklyReportHTML(
  clientUrl: string,
  geoAnalysis: GEOAnalysis,
  contentWritten: ContentPiece[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e0e0e0; }
      .header { background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .score-grid { display: flex; justify-content: space-around; padding: 20px; background: #1a1a1a; }
      .score-box { text-align: center; }
      .score-num { font-size: 32px; font-weight: bold; }
      .section { background: #1a1a1a; padding: 20px; margin: 10px 0; border-radius: 8px; border: 1px solid #333; }
      .item { padding: 8px 0; border-bottom: 1px solid #333; }
      h2 { color: #f59e0b; } h3 { color: #6366f1; }
      .badge { background: #6366f1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
      .high { color: #ef4444; } .medium { color: #f59e0b; } .low { color: #10b981; }
    </style></head>
    <body>
      <div class="header">
        <h1 style="color:white; margin:0">Weekly SEO & GEO Report</h1>
        <p style="color:rgba(255,255,255,0.8)">${clientUrl}</p>
      </div>
      
      <div class="score-grid">
        <div class="score-box">
          <div class="score-num" style="color:#f59e0b">${geoAnalysis.geo_score}</div>
          <div>GEO Score</div>
        </div>
        <div class="score-box">
          <div class="score-num" style="color:#10b981">${contentWritten.length}</div>
          <div>Articles Written</div>
        </div>
        <div class="score-box">
          <div class="score-num" style="color:#6366f1">${geoAnalysis.content_gaps.length}</div>
          <div>Content Gaps</div>
        </div>
      </div>
      
      <div class="section">
        <h2>AI Search Visibility</h2>
        <div class="item">ChatGPT Optimized: ${geoAnalysis.ai_visibility.chatgpt_optimized ? '✅' : '❌'}</div>
        <div class="item">Perplexity Optimized: ${geoAnalysis.ai_visibility.perplexity_optimized ? '✅' : '❌'}</div>
        <div class="item">Google SGE Optimized: ${geoAnalysis.ai_visibility.google_sge_optimized ? '✅' : '❌'}</div>
      </div>
      
      ${contentWritten.length > 0 ? `
      <div class="section">
        <h2>Content Ready to Publish</h2>
        ${contentWritten.map(c => `
          <div class="item">
            <strong>${c.title}</strong>
            <br><small>${c.type} | ${c.estimated_word_count} words | Keyword: ${c.target_keyword}</small>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="section">
        <h2>Top Priority Actions</h2>
        ${geoAnalysis.action_plan.slice(0, 5).map(a => `
          <div class="item">
            <span class="${a.impact}">[${a.impact.toUpperCase()}]</span> ${a.action}
          </div>
        `).join('')}
      </div>
      
      <div style="text-align:center; padding: 20px; color: #666;">
        <p>Powered by <strong>RankMind AI</strong> — Real SEO, Real Results</p>
        <a href="https://rankmind-ai.vercel.app/dashboard" style="color:#f59e0b">View Full Dashboard →</a>
      </div>
    </body>
    </html>
  `;
}
