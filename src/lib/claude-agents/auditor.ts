import Anthropic from '@anthropic-ai/sdk'

// Read API key from either env var name — Vercel uses Rank_mind_Claude
const apiKey = process.env.Rank_mind_Claude || process.env.ANTHROPIC_API_KEY || ''

if (!apiKey) {
  console.error('[ClaudeAudit] No Anthropic API key found. Checked: Rank_mind_Claude, ANTHROPIC_API_KEY')
}

const anthropic = new Anthropic({ apiKey })

// Tighter prompt — Claude must do ONE search then immediately return JSON in the same response
const AUDITOR_SYSTEM_PROMPT = `You are an elite SEO auditor. You have ONE web search call available.

WORKFLOW (strictly follow this order):
1. Call web_search ONCE to browse the given URL
2. In your VERY NEXT message, immediately return the JSON audit result — no preamble, no explanation

The JSON must be the ONLY thing in your final text response:
{
  "url": "the URL you audited",
  "overall_score": 0-100,
  "grade": "A/B/C/D/F",
  "summary": "2 sentences with real findings from the page",
  "issues": [
    {
      "severity": "critical|warning|info",
      "title": "Short issue title",
      "detail": "Specific detail with actual values found",
      "fix": "Exact actionable fix",
      "category": "technical|content|seo|geo"
    }
  ],
  "wins": ["Specific good thing found on this site"],
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
  "quick_wins": ["Fastest fix with immediate impact"]
}

CRITICAL: After the web search, output ONLY the raw JSON. No markdown. No code fences. No explanation.`

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
      summary: 'Audit service is not configured. Please contact info@rank-mind.com',
      issues: [],
      wins: [],
      scores: {},
      quick_wins: [],
      error: 'API key not configured'
    }
  }

  try {
    console.log('[ClaudeAudit] Starting single-turn audit for:', url)
    const startTime = Date.now()

    // Single turn: Claude searches and immediately returns JSON in one response
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',  // Faster model to stay under 60s timeout
      max_tokens: 2000,
      system: AUDITOR_SYSTEM_PROMPT,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search'
        }
      ],
      tool_choice: { type: 'auto' },
      messages: [
        {
          role: 'user',
          content: `Audit this website: ${url}\n\nSearch for it once, then immediately return the JSON audit result.`
        }
      ]
    })

    const elapsed = Date.now() - startTime
    console.log('[ClaudeAudit] Response received in', elapsed, 'ms. Stop reason:', response.stop_reason)

    // Extract all text blocks from the response (may come after tool_use blocks)
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()

    if (!textContent) {
      // Claude only returned tool_use blocks — need a follow-up turn
      // This is a fallback for when claude-haiku doesn't auto-continue
      console.log('[ClaudeAudit] No text in first response, sending follow-up turn...')

      const followUp = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 2000,
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
            content: `Audit this website: ${url}\n\nSearch for it once, then immediately return the JSON audit result.`
          },
          {
            role: 'assistant',
            content: response.content
          },
          {
            role: 'user',
            content: 'Return the JSON now. Only the raw JSON object, nothing else.'
          }
        ]
      })

      const followUpText = followUp.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .trim()

      if (!followUpText) {
        throw new Error('No text response from Claude after follow-up turn')
      }

      return parseAuditJson(followUpText, url)
    }

    return parseAuditJson(textContent, url)

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
