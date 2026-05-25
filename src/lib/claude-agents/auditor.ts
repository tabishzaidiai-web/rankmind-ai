import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

const AUDITOR_SYSTEM_PROMPT = `You are an elite SEO and GEO audit specialist with 20 years experience.

When given a website URL, you MUST use the web_search tool to:
1. Browse the actual live website and read its real content
2. Check the page source for title tags, meta descriptions, H1 tags
3. Look for JSON-LD schema markup blocks
4. Check if FAQ answers are visible in HTML or hidden by JavaScript
5. Identify brand name consistency across domain, email, and social handles
6. Check for AI citation signals and GEO visibility

RULES:
- Always search for the actual URL first before giving any findings
- Quote real values you found (e.g. "Title is 'Your actual title here' at 67 characters")
- Never invent or assume — only report what you actually found by browsing
- Be specific: mention actual tag values, actual character counts, actual issues

Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, just the raw JSON:
{
  "url": "the URL you audited",
  "overall_score": 0-100,
  "grade": "A/B/C/D/F",
  "summary": "2 sentences mentioning the actual page title and real issues found",
  "issues": [
    {
      "severity": "critical",
      "title": "Short issue title",
      "detail": "Specific detail with actual values found on this site",
      "fix": "Exact actionable fix",
      "category": "technical"
    }
  ],
  "wins": ["Specific good thing found on this actual site"],
  "scores": {
    "title": 0-100,
    "meta": 0-100,
    "h1": 0-100,
    "https": 0-100,
    "schema": 0-100,
    "mobile": 0-100,
    "content": 0-100,
    "geo": 0-100
  },
  "quick_wins": ["Fastest fix that will have immediate impact"]
}`

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  fix: string
  category: string
}

export interface ClaudeAuditResult {
  url: string
  overall_score: number
  grade: string
  summary: string
  issues: AuditIssue[]
  wins: string[]
  scores: Record<string, number>
  quick_wins: string[]
  error?: string
}

export async function runClaudeDeepAudit(url: string): Promise<ClaudeAuditResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: AUDITOR_SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search'
        }
      ],
      messages: [
        {
          role: 'user',
          content: `Perform a deep SEO and GEO audit of this website. Browse it, read the real source, find real specific issues: ${url}`
        }
      ]
    })

    // Extract text content from response — may come after tool use blocks
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()

    if (!textContent) {
      throw new Error('No text response from Claude — the model may have only returned tool use blocks')
    }

    // Clean and parse JSON — strip any accidental markdown fences
    const cleaned = textContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const result = JSON.parse(cleaned) as ClaudeAuditResult
    return result

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[ClaudeAudit] Error:', msg)

    // Return a safe error result instead of throwing
    return {
      url,
      overall_score: 0,
      grade: 'F',
      summary: `Could not complete audit: ${msg}`,
      issues: [],
      wins: [],
      scores: {},
      quick_wins: [],
      error: msg
    }
  }
}
