import Anthropic from '@anthropic-ai/sdk'

// Read API key from either env var name — Vercel uses Rank_mind_Claude
const apiKey = process.env.Rank_mind_Claude || process.env.ANTHROPIC_API_KEY || ''

if (!apiKey) {
  console.error('[ClaudeAudit] No Anthropic API key found. Checked: Rank_mind_Claude, ANTHROPIC_API_KEY')
}

const anthropic = new Anthropic({ apiKey })

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
  // Guard: fail fast with a clean error result if no API key
  const key = process.env.Rank_mind_Claude || process.env.ANTHROPIC_API_KEY
  if (!key) {
    console.error('[ClaudeAudit] Missing API key')
    return {
      url,
      overall_score: 0,
      grade: 'F',
      summary: 'Audit service is not configured. Please contact support@rankmind.ai',
      issues: [],
      wins: [],
      scores: {},
      quick_wins: [],
      error: 'API key not configured'
    }
  }

  try {
    // ── First turn: let Claude use web_search tool ────────────────────────────
    const firstResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
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

    console.log('[ClaudeAudit] First response stop_reason:', firstResponse.stop_reason)

    // ── Extract any text from the first response ──────────────────────────────
    const firstTextBlocks = firstResponse.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()

    // If Claude already returned a text block with JSON, use it directly
    if (firstTextBlocks && firstTextBlocks.includes('"overall_score"')) {
      return parseAuditJson(firstTextBlocks, url)
    }

    // ── If Claude stopped to use tools, send a second turn ───────────────────
    // This is the normal flow: Claude searches, then we ask it to synthesize
    if (firstResponse.stop_reason === 'tool_use' || firstResponse.stop_reason === 'end_turn') {
      const secondResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
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
          },
          {
            role: 'assistant',
            content: firstResponse.content
          },
          {
            role: 'user',
            content: 'Now based on what you found, return the complete JSON audit result. Return ONLY the raw JSON object, no markdown, no explanation.'
          }
        ]
      })

      console.log('[ClaudeAudit] Second response stop_reason:', secondResponse.stop_reason)

      const secondTextBlocks = secondResponse.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .trim()

      if (secondTextBlocks) {
        return parseAuditJson(secondTextBlocks, url)
      }
    }

    // Fallback: no text content found in either response
    throw new Error('No text response from Claude after two turns — model may have only returned tool use blocks')

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[ClaudeAudit] Error:', msg)

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

/** Parse and clean the JSON string returned by Claude */
function parseAuditJson(text: string, url: string): ClaudeAuditResult {
  // Strip accidental markdown fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Find the JSON object boundaries in case there is surrounding prose
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error(`Response did not contain a JSON object. Raw: ${cleaned.substring(0, 200)}`)
  }

  const jsonStr = cleaned.substring(start, end + 1)
  const result = JSON.parse(jsonStr) as ClaudeAuditResult
  return result
}
