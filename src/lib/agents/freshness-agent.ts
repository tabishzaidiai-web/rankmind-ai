/**
 * Content Freshness Monitor Agent
 * Analyzes a website's content freshness across all pages and provides
 * specific update recommendations to maintain AI citation eligibility.
 * 
 * Key insight: Content under 90 days old is 3x more likely to be cited in AI answers.
 */
import { agentReason, fetchPageContent } from './core';

export interface FreshnessAnalysis {
  url: string;
  analyzed_at: string;
  overall_freshness_score: number;

  // Site-wide freshness assessment
  site_assessment: {
    estimated_last_major_update: string;
    content_age_risk: 'low' | 'medium' | 'high' | 'critical';
    pages_at_risk: number;
    ai_citation_decay_status: string;
  };

  // Pages that need updating (prioritized)
  pages_to_update: Array<{
    url: string;
    estimated_age_days: number;
    decay_risk: 'low' | 'medium' | 'high' | 'critical';
    current_ranking_potential: string;
    update_priority: number;
    specific_updates_needed: string[];
    new_sections_to_add: string[];
    outdated_stats_to_replace: string[];
    estimated_time_to_update: string;
    expected_citation_boost: string;
  }>;

  // What to update (specific content recommendations)
  update_recommendations: Array<{
    category: string;
    recommendation: string;
    why_it_matters: string;
    example: string;
    effort: 'quick' | 'medium' | 'large';
  }>;

  // New content opportunities
  new_content_opportunities: Array<{
    title: string;
    type: string;
    target_keywords: string[];
    why_now: string;
    estimated_impact: string;
    outline: string[];
  }>;

  // 90-day refresh plan
  refresh_plan: Array<{
    week: number;
    action: string;
    page: string;
    specific_task: string;
    time_estimate: string;
  }>;
}

export async function runFreshnessAnalysis(url: string): Promise<FreshnessAnalysis> {
  const pageData = await fetchPageContent(url);

  const analysis = await agentReason<FreshnessAnalysis>(
    `You are a Content Freshness Expert specializing in AI search optimization.
    
    Analyze this website's content freshness and provide a complete refresh strategy.
    
    Critical facts about content freshness and AI citations in 2026:
    - Content under 90 days old is 3x more likely to be cited in AI answers
    - Content over 180 days old loses citation eligibility regardless of initial ranking
    - AirOps research confirms a "90-day content freshness decay" that is real and measurable
    - Quarterly content refresh programs are the highest-leverage play in AI visibility
    - Statistics older than 12 months should be replaced with current data
    - Adding new sections to existing content (vs full rewrites) is 5x more efficient
    - FAQ sections added to existing content immediately improve AI citation rates
    - Pages that sit untouched for 6+ months lose citation eligibility
    
    Provide a complete freshness analysis with:
    1. Overall freshness score (0-100)
    2. Site assessment with decay risk level
    3. Specific pages that need updating (based on content analysis)
    4. Exact update recommendations with examples
    5. New content opportunities based on current trends
    6. A practical 90-day refresh plan with weekly tasks
    
    Be specific and actionable. Every recommendation should have a clear "do this" instruction.`,
    `URL: ${url}
    Page Title: ${pageData.title}
    Meta Description: ${pageData.metaDescription}
    Content (first 4000 chars): ${pageData.bodyText.slice(0, 4000)}
    
    Analyze this content for freshness signals:
    - Are statistics current or outdated?
    - Are there references to specific years/dates that may be stale?
    - What new developments in this topic area should be covered?
    - What FAQ questions are people asking AI engines about this topic?
    - What sections could be added to improve AI citation eligibility?
    
    Return a complete FreshnessAnalysis JSON with all fields.
    For pages_to_update: identify 3-5 specific pages/sections that need refreshing
    For new_content_opportunities: identify 3-4 new pieces to create
    For refresh_plan: create a 12-week plan with specific weekly tasks`
  );

  return {
    ...analysis,
    url,
    analyzed_at: new Date().toISOString(),
  };
}
