import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Vercel Hobby: 10s max — this route must complete in < 8s ─────────────────
// Call 2 of 2: Receives toolName + toolArgs from the frontend (returned by Call 1).
// Executes the actual agent API, then sends the result back to Gemini for a
// concise spoken synthesis. Returns the final spoken response.
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 8

// ── Tool executor: calls the existing agent API routes internally ─────────────
async function executeTool(
  toolName: string,
  args: Record<string, string>,
  origin: string,
  cookieHeader: string
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cookie': cookieHeader
  }

  const toolRouteMap: Record<string, string> = {
    run_seo_audit: '/api/seo-audit',
    run_geo_analysis: '/api/geo-score',
    run_backlink_finder: '/api/backlinks',
    run_ai_citation_check: '/api/ai-citation',
    run_schema_generator: '/api/schema-generator',
    run_content_freshness: '/api/freshness'
  }

  if (toolName === 'run_full_audit') {
    // Run SEO + GEO in parallel (fastest two), then return combined summary
    const [seoRes, geoRes] = await Promise.allSettled([
      fetch(`${origin}/api/seo-audit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: args.url })
      }).then(r => r.json()).catch(() => ({ error: 'SEO audit failed' })),
      fetch(`${origin}/api/geo-score`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: args.url })
      }).then(r => r.json()).catch(() => ({ error: 'GEO analysis failed' }))
    ])

    return {
      seo_audit: seoRes.status === 'fulfilled' ? seoRes.value : { error: 'SEO audit failed' },
      geo_analysis: geoRes.status === 'fulfilled' ? geoRes.value : { error: 'GEO analysis failed' },
      note: 'Full audit ran SEO and GEO analysis. Schema, citation, freshness, and backlinks are available in the dashboard.'
    }
  }

  const route = toolRouteMap[toolName]
  if (!route) {
    return { error: `Unknown tool: ${toolName}` }
  }

  try {
    const res = await fetch(`${origin}${route}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args)
    })
    if (!res.ok) {
      return { error: `Agent returned ${res.status}` }
    }
    return await res.json()
  } catch (err) {
    console.error(`[VoiceAgent/Execute] Tool ${toolName} failed:`, err)
    return { error: `Tool execution failed: ${String(err)}` }
  }
}

// ── Synthesis prompts ─────────────────────────────────────────────────────────
const SYNTHESIS_PROMPT_VISITOR = `You are Aria, the RankMind AI voice assistant. 
A tool just ran and returned results. Summarise the key findings in 2-3 friendly spoken sentences (max 70 words).
Focus on the most important issue found. End with: "Sign up free to unlock the full report and all our AI-era SEO tools."`

const SYNTHESIS_PROMPT_DASHBOARD = `You are Aria, the RankMind AI voice assistant.
A tool just ran and returned results. Summarise the key findings in 3-4 spoken sentences (max 90 words).
Highlight the single most important finding and one quick win. Tell the user to check their dashboard for the full detailed report.
Never read raw JSON, field names, or long lists.`

// ── Main handler: Call 2 ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('[VoiceAgent/Execute] GEMINI_API_KEY is not set')
    return NextResponse.json({
      response: 'The voice agent is not configured yet. Please add your GEMINI_API_KEY to Vercel environment variables.',
      error: 'Agent not configured'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const {
      toolName,
      toolArgs,
      conversationHistory = [],
      isVisitor,
      userId
    } = body

    if (!toolName) {
      return NextResponse.json({
        response: 'No tool specified.',
        conversationHistory
      }, { status: 400 })
    }

    // Build origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL ||
      `https://${request.headers.get('host')}` ||
      'https://www.rank-mind.com'

    // Forward cookies for authenticated agent calls
    const cookieHeader = request.headers.get('cookie') || ''

    // ── Execute the tool ──────────────────────────────────────────────────────
    const toolResult = await executeTool(
      toolName,
      toolArgs as Record<string, string>,
      origin,
      cookieHeader
    )

    // ── Log to timeline (non-blocking) ────────────────────────────────────────
    if (userId) {
      const supabase = await createClient()
      void (async () => {
        try {
          await supabase.from('timeline_events').insert({
            user_id: userId,
            agent: 'VoiceMaster',
            action: `Executed ${toolName}`,
            outcome: `URL: ${(toolArgs as Record<string, string>).url || 'unknown'}`
          })
        } catch { /* non-critical */ }
      })()
    }

    // ── Synthesise spoken response via Gemini ─────────────────────────────────
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: isVisitor ? SYNTHESIS_PROMPT_VISITOR : SYNTHESIS_PROMPT_DASHBOARD
    })

    // Trim tool result to avoid token overflow (max 2000 chars)
    const toolResultSummary = JSON.stringify(toolResult).slice(0, 2000)

    const synthesisResult = await model.generateContent(
      `Tool "${toolName}" returned this result:\n${toolResultSummary}\n\nNow give the spoken summary.`
    )

    const spokenText = synthesisResult.response.text() ||
      'I completed the analysis. Please check your dashboard for the full results.'

    // ── Build updated conversation history ────────────────────────────────────
    const updatedHistory = [
      ...conversationHistory,
      { role: 'model', parts: [{ text: spokenText }] }
    ]

    return NextResponse.json({
      response: spokenText,
      toolCalled: toolName,
      agentAction: true,
      conversationHistory: updatedHistory
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('[VoiceAgent/Execute] Error:', msg, stack)
    return NextResponse.json({
      response: "I completed the analysis but had trouble summarising it. Please check your dashboard for the full results.",
      conversationHistory: [],
      error: process.env.NODE_ENV === 'development' ? msg : 'Internal error'
    }, { status: 500 })
  }
}
