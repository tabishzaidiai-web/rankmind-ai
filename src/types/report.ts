/**
 * RankMind AI — Report System Types
 */

export interface ReportAuditData {
  url: string;
  analyzed_at: string;
  overall_score: number;
  grade: string;
  keywords: Array<{
    keyword: string;
    type: string;
    estimated_volume: number;
    difficulty: number;
    relevance: number;
  }>;
  on_page: {
    title_tag: { score: number; present: boolean; length: number; includes_keyword: boolean; value: string; recommendation: string };
    meta_description: { score: number; present: boolean; length: number; includes_keyword: boolean; value: string; recommendation: string };
    headings: { score: number; h1_count: number; h2_count: number; h3_count: number; keyword_in_h1: boolean; recommendation: string };
    content_length: { score: number; word_count: number; recommended_min: number; recommendation: string };
    internal_links: { score: number; count: number; recommendation: string };
    images_alt: { score: number; total: number; missing_alt: number; recommendation: string };
  };
  technical: {
    load_time_ms: number;
    load_time_score: number;
    https: boolean;
    mobile_friendly: boolean;
    canonical_tag: boolean;
    robots_txt: boolean;
    sitemap: boolean;
    structured_data: boolean;
  };
  content_quality: {
    score: number;
    fact_density: number;
    readability_score: number;
    eeat_signals?: string[];
    improvement_suggestions?: string[];
  };
  geo_readiness: {
    score: number;
    ai_search_optimized?: boolean;
    schema_markup?: boolean;
    faq_section?: boolean;
    clear_answers?: boolean;
    recommendations?: string[];
  };
  action_plan: Array<{
    priority: number;
    action: string;
    task?: string;
    whyItMatters?: string;
    recommendation?: string;
    exampleFix?: string;
    impact: string;
    effort: string;
    timeline?: string;
    category?: string;
  }>;
  llm_recommendations: string[];
  ai_citation_readiness_score?: number;
  ai_citation_readiness_summary?: string;
  eeat_score?: number;
  eeat_breakdown?: { experience: number; expertise: number; authoritativeness: number; trustworthiness: number };
  topical_authority_score?: number;
  topical_authority_gaps?: string[];
  semantic_completeness_score?: number;
  entity_density_estimate?: number;
}

export interface ReportRequest {
  websiteUrl: string;
  reportType: 'seo-audit' | 'backlink' | 'content' | 'geo' | 'full';
  auditData: ReportAuditData;
  includeEmail?: boolean;
  userEmail?: string;
  userName?: string;
}

export interface ReportResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
  reportId?: string;
}

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'enterprise';
