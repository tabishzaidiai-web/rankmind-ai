/**
 * AI Citation Tracker Agent
 * Analyzes a website's visibility in AI-generated search results (AI Overviews, AI Mode, ChatGPT, Perplexity)
 * and provides actionable recommendations to improve citation rates.
 */
import { agentReason, fetchPageContent } from './core';

export interface CitationAnalysis {
  url: string;
  analyzed_at: string;
  overall_citation_score: number;
  grade: string;

  // Per-platform citation readiness
  platforms: {
    google_ai_overviews: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    google_ai_mode: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    chatgpt_search: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    perplexity: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
  };

  // Content structure signals
  content_signals: {
    semantic_completeness_score: number;
    optimal_passage_length: boolean;
    faq_sections_present: boolean;
    statistics_density: number; // per 200 words
    entity_density: number; // recognized entities per 500 words
    declarative_answer_openers: boolean;
    front_loaded_key_claims: boolean;
  };

  // E-E-A-T signals
  eeat_signals: {
    score: number;
    author_byline_present: boolean;
    expert_citations: boolean;
    original_data_present: boolean;
    brand_entity_recognized: boolean;
    external_mentions: number;
    improvements: string[];
  };

  // Schema markup
  schema_signals: {
    score: number;
    types_detected: string[];
    missing_high_impact: string[];
    faq_schema_present: boolean;
    article_schema_present: boolean;
  };

  // Freshness
  freshness_signals: {
    score: number;
    last_updated_estimate: string;
    days_since_update: number;
    citation_decay_risk: 'low' | 'medium' | 'high';
    recommendation: string;
  };

  // Competitor citation gaps
  citation_gaps: Array<{
    topic: string;
    why_competitors_win: string;
    fix: string;
    impact: 'high' | 'medium' | 'low';
  }>;

  // Prioritized action plan
  action_plan: Array<{
    priority: number;
    action: string;
    why: string;
    expected_impact: string;
    effort: 'quick' | 'medium' | 'large';
    timeline: string;
  }>;

  // AI citation share of voice
  share_of_voice: {
    estimated_citation_rate: number; // 0-100%
    industry_average: number;
    potential_if_optimized: number;
    traffic_opportunity: string;
  };
}

export async function runAICitationAnalysis(url: string, targetKeywords: string[]): Promise<CitationAnalysis> {
  const pageData = await fetchPageContent(url);

  const analysis = await agentReason<CitationAnalysis>(
    `You are an AI Citation Optimization Expert specializing in Google AI Overviews, Google AI Mode, ChatGPT Search, and Perplexity.
    
    Analyze this website's content and structure to determine how likely it is to be CITED inside AI-generated search answers.
    
    Key facts about AI citation in 2026:
    - AI Overviews appear on 48% of all Google queries
    - Only 53% of AI Mode citations match the top 10 organic results — ranking ≠ citation
    - Content under 90 days old is 3x more likely to be cited
    - Content scoring 8.5/10+ on semantic completeness is 4.2x more likely to appear in AI Overviews
    - Optimal AI-extractable passage length is 134-167 words
    - FAQ sections get cited at 3x the rate of non-FAQ content
    - Pages with 15+ recognized entities show 4.8x higher citation probability
    - Multi-modal content (text + images + video + schema) sees 156% higher selection rates
    - 96% of AI Overview citations come from sources with strong E-E-A-T signals
    - 44.2% of all LLM citations come from the FIRST 30% of page text (front-loading matters)
    - AI visitors convert at 14.2% vs 2.8% for traditional organic (5x quality premium)
    
    Evaluate the page on ALL these dimensions and provide specific, actionable scores and recommendations.
    Be precise with scores (0-100). Be specific about what is missing and exactly how to fix it.
    
    Return a complete CitationAnalysis JSON object with all fields populated with realistic, specific analysis.`,
    `URL: ${url}
    Target Keywords: ${targetKeywords.join(', ')}
    Page Title: ${pageData.title}
    Meta Description: ${pageData.metaDescription}
    Word Count: ~${Math.round(pageData.bodyText.length / 5)} words
    Content Preview (first 3000 chars): ${pageData.bodyText.slice(0, 3000)}
    
    Analyze this content and return a complete CitationAnalysis JSON with all fields.
    For overall_citation_score: 0-100 (how citation-ready is this page across all AI platforms)
    For grade: A/B/C/D/F based on citation readiness
    For platforms: score each 0-100 with likelihood (Very High/High/Medium/Low/Very Low)
    For share_of_voice: estimate based on content quality vs industry standards
    For citation_gaps: identify 3-5 specific topics where competitors are winning citations
    For action_plan: provide 5-7 specific actions ranked by impact/effort ratio`
  );

  return {
    ...analysis,
    url,
    analyzed_at: new Date().toISOString(),
  };
}
