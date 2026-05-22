/**
 * Schema Markup Generator Agent
 * Generates production-ready JSON-LD structured data for any webpage
 * to maximize AI citation eligibility and rich result appearances.
 */
import { agentReason, fetchPageContent } from './core';

export interface SchemaGenerationResult {
  url: string;
  generated_at: string;
  page_type: string;
  schemas: Array<{
    type: string;
    priority: 'critical' | 'high' | 'medium';
    why_it_matters: string;
    ai_citation_impact: string;
    json_ld: string;
  }>;
  implementation_guide: string;
  expected_improvements: {
    rich_results: string[];
    ai_citation_boost: string;
    estimated_ctr_improvement: string;
  };
  validation_checklist: string[];
}

export async function generateSchemaMarkup(url: string, pageType?: string): Promise<SchemaGenerationResult> {
  const pageData = await fetchPageContent(url);

  const result = await agentReason<SchemaGenerationResult>(
    `You are a Schema Markup Expert specializing in structured data for AI search optimization.
    
    Generate production-ready JSON-LD schema markup for this webpage that will:
    1. Maximize eligibility for Google AI Overviews citations
    2. Enable rich results in traditional search (FAQ boxes, how-to cards, article cards)
    3. Help AI systems (ChatGPT, Perplexity, Gemini) understand and cite the content
    4. Improve E-E-A-T signals through Author and Organization schema
    
    Key facts about schema and AI citations:
    - FAQPage schema increases AI Overview citation probability by 3x
    - Article schema with author credentials improves E-E-A-T scoring
    - HowTo schema enables step-by-step rich results
    - BreadcrumbList helps AI understand site structure
    - SpeakableSpecification helps voice search and AI assistants
    - Organization schema with sameAs links builds entity recognition
    - Product/Service schema enables commercial query citations
    
    Generate COMPLETE, VALID, PRODUCTION-READY JSON-LD for ALL applicable schema types.
    Each JSON-LD must be complete and immediately usable — no placeholders.
    Use the actual page content to populate all fields.
    
    Return a SchemaGenerationResult with all fields populated.`,
    `URL: ${url}
    Page Title: ${pageData.title}
    Meta Description: ${pageData.metaDescription}
    Page Type Hint: ${pageType || 'auto-detect'}
    Content (first 4000 chars): ${pageData.bodyText.slice(0, 4000)}
    
    Generate complete JSON-LD for all applicable schema types.
    For each schema, provide:
    - type: schema type name (e.g., "FAQPage", "Article", "Organization")
    - priority: critical/high/medium
    - why_it_matters: specific reason this schema helps AI citations
    - ai_citation_impact: expected improvement in citation likelihood
    - json_ld: complete, valid JSON-LD string (properly escaped)
    
    Also provide:
    - implementation_guide: step-by-step instructions to add these schemas
    - expected_improvements: rich results, AI citation boost, CTR improvement
    - validation_checklist: steps to validate the implementation`
  );

  return {
    ...result,
    url,
    generated_at: new Date().toISOString(),
  };
}
