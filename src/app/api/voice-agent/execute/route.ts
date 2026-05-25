import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── Call 2 of 3: EXECUTE ─────────────────────────────────────────────────────
// Receives toolName + toolArgs from the frontend (returned by /think).
// Calls the appropriate existing agent API route.
// Returns { result: rawToolResult } — no synthesis here.
// Synthesis happens in Call 3 (/respond).
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 10

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
    run_seo_audit:         '/api/seo-audit',
    run_geo_analysis:      '/api/geo-score',
    run_backlink_finder:   '/api/backlinks',
    run_ai_citation_check: '/api/ai-citation',
    run_schema_generator:  '/api/schema-generator',
    run_content_freshness: '/api/freshness'
  }

  if (toolName === 'run_full_audit') {
    const [seoRes, geoRes] = await Promise.allSettled([
      fetch(`${origin}/api/seo-audit`, {
        method: 'POST', headers,
        body: JSON.stringify({ url: args.url })
      }).then(r => r.json()).catch(() => ({ error: 'SEO audit failed' })),
      fetch(`${origin}/api/geo-score`, {
        method: 'POST', headers,
        body: JSON.stringify({ url: args.url })
      }).then(r => r.json()).catch(() => ({ error: 'GEO analysis failed' }))
    ])

    return {
      seo_audit:    seoRes.status === 'fulfilled' ? seoRes.value : { error: 'SEO audit failed' },
      geo_analysis: geoRes.status === 'fulfilled' ? geoRes.value : { error: 'GEO analysis failed' },
      note: 'Full audit ran SEO and GEO. Schema, citation, freshness, and backlinks are in the dashboard.'
    }
  }

  const route = toolRouteMap[toolName]
  if (!route) return { error: `Unknown tool: ${toolName}` }

  try {
    const res = await fetch(`${origin}${route}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args)
    })
    if (!res.ok) return { error: `Agent returned ${res.status}` }
    return await res.json()
  } catch (err) {
    console.error(`[VoiceAgent/Execute] Tool ${toolName} failed:`, err)
    return { error: `Tool execution failed: ${String(err)}` }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { toolName, toolArgs, userId } = body

    if (!toolName) {
      return NextResponse.json({ error: 'No toolName provided' }, { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ||
      `https://${request.headers.get('host')}` ||
      'https://www.rank-mind.com'

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

    return NextResponse.json({ result: toolResult, toolName })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[VoiceAgent/Execute] Error:', msg)
    return NextResponse.json({
      result: { error: 'Tool execution failed' },
      error: process.env.NODE_ENV === 'development' ? msg : 'Internal error'
    }, { status: 500 })
  }
}
