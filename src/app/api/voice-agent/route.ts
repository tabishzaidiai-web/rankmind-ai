import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

export const maxDuration = 60

// ============================================
// TOOL DEFINITIONS — RankMind agents as Gemini function declarations
// ============================================
const RANKMIND_TOOLS = [
  {
    name: 'run_seo_audit',
    description: 'Runs a full SEO audit on a website. Checks title tag, meta description, H1, HTTPS, page speed, mobile friendliness, schema markup, canonical tags, content depth, and image alt text. Returns a score out of 100, a letter grade, specific issues found, and quick wins.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The full website URL to audit. Always include https://'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'run_geo_analysis',
    description: 'Analyses how visible the website is in AI search engines — ChatGPT, Perplexity, Google AI Overviews, Gemini, and Microsoft Copilot. Returns a GEO visibility score and specific recommendations to appear in AI-generated answers.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The full website URL to analyse'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'run_backlink_finder',
    description: 'Finds real backlink opportunities for a website. Searches the web for guest post sites, contributor blogs, and resource pages in the same niche. Returns prospects with domain authority scores and ready-to-send outreach email templates.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The website URL'
        },
        niche: {
          type: SchemaType.STRING,
          description: 'The business niche or industry. Examples: digital marketing, e-commerce fashion, SaaS project management'
        }
      },
      required: ['url', 'niche']
    }
  },
  {
    name: 'run_ai_citation_check',
    description: 'Checks how well the website content is structured to be cited by AI systems like ChatGPT and Perplexity when answering user questions. Returns citation readiness score, E-E-A-T score, semantic completeness score, and specific gaps to fill.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The website URL to check'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'run_schema_generator',
    description: 'Generates JSON-LD structured data schema markup for the website. Helps Google display rich results like star ratings, FAQs, prices, and business info in search results.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The website URL'
        },
        page_type: {
          type: SchemaType.STRING,
          description: 'Type of page: homepage, product, article, local_business, faq, or auto'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'run_content_freshness',
    description: 'Analyses content decay risk — checks if the website content is becoming outdated and losing rankings. Returns a freshness score, risk level, and a 12-week content refresh plan.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The website URL'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'run_full_audit',
    description: 'Runs ALL agents in sequence — SEO audit, GEO analysis, AI citation check, schema generation, content freshness, and backlink finder. Use this when the user wants a complete analysis or says things like "analyse everything", "full audit", "check my whole site", or "run all agents".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: 'The website URL'
        },
        niche: {
          type: SchemaType.STRING,
          description: 'Business niche for backlink finding. If unknown, make a reasonable guess from the URL or ask.'
        }
      },
      required: ['url']
    }
  }
]

// ============================================
// SYSTEM PROMPTS
// ============================================
const VISITOR_SYSTEM_PROMPT = `You are the RankMind AI Voice Agent — a friendly, expert SEO assistant on the RankMind AI website.

You are in VISITOR MODE. You can only run one tool: run_seo_audit.

Your personality: Confident, helpful, slightly enthusiastic about SEO. Speak in plain English, not jargon. Keep responses under 3 sentences for voice delivery.

When a user gives you a URL, immediately call run_seo_audit with that URL. Do not ask for confirmation.

After delivering results, always end with: "Sign up free at rank-mind.com to get your full report, track keywords, and find backlink opportunities."

If the user asks about other features (GEO, backlinks, content), say: "That's available in your dashboard — sign up free and I'll run it for you."

Always be encouraging and positive about what can be improved.`

const DASHBOARD_SYSTEM_PROMPT = `You are the RankMind AI Voice Agent — a powerful AI SEO assistant embedded in the RankMind AI dashboard.

You have access to 7 specialist agents:
1. run_seo_audit — Full technical SEO audit with score, grade, issues, and quick wins
2. run_geo_analysis — AI search visibility across ChatGPT, Perplexity, Gemini, AI Overviews
3. run_backlink_finder — Real backlink opportunities with outreach email templates
4. run_ai_citation_check — Citation readiness for AI systems, E-E-A-T scoring
5. run_schema_generator — JSON-LD structured data markup generator
6. run_content_freshness — Content decay risk analysis and 12-week refresh plan
7. run_full_audit — Runs ALL agents in sequence for a complete site analysis

Your personality: Expert, efficient, results-focused. Speak in plain English. Keep spoken responses under 4 sentences — the full data appears in the dashboard.

When a user gives you a URL and a task, call the appropriate tool immediately. Do not ask for confirmation.

After tool results, summarise the key finding in 1-2 sentences and say "Full results are now in your dashboard."

For run_full_audit, tell the user you're running all 7 agents and it will take about 30 seconds.`

// ============================================
// TOOL EXECUTOR — calls existing agent API routes
// ============================================
async function executeTool(
  name: string,
  args: Record<string, string>,
  origin: string,
  cookieHeader: string
): Promise<Record<string, unknown>> {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookieHeader,
    'x-internal-call': 'voice-agent'
  }

  try {
    switch (name) {
      case 'run_seo_audit': {
        const res = await fetch(`${origin}/api/seo-audit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url })
        })
        return await res.json()
      }

      case 'run_geo_analysis': {
        const res = await fetch(`${origin}/api/geo-score`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url })
        })
        return await res.json()
      }

      case 'run_backlink_finder': {
        const res = await fetch(`${origin}/api/backlinks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url, niche: args.niche || 'general' })
        })
        return await res.json()
      }

      case 'run_ai_citation_check': {
        const res = await fetch(`${origin}/api/ai-citation`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url })
        })
        return await res.json()
      }

      case 'run_schema_generator': {
        const res = await fetch(`${origin}/api/schema-generator`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url, page_type: args.page_type || 'auto' })
        })
        return await res.json()
      }

      case 'run_content_freshness': {
        const res = await fetch(`${origin}/api/freshness`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: args.url })
        })
        return await res.json()
      }

      case 'run_full_audit': {
        // Run SEO + GEO in parallel, then the rest
        const [seoRes, geoRes] = await Promise.all([
          fetch(`${origin}/api/seo-audit`, { method: 'POST', headers, body: JSON.stringify({ url: args.url }) }),
          fetch(`${origin}/api/geo-score`, { method: 'POST', headers, body: JSON.stringify({ url: args.url }) })
        ])
        const [seo, geo] = await Promise.all([seoRes.json(), geoRes.json()])

        const [citationRes, schemaRes, freshnessRes, backlinksRes] = await Promise.all([
          fetch(`${origin}/api/ai-citation`, { method: 'POST', headers, body: JSON.stringify({ url: args.url }) }),
          fetch(`${origin}/api/schema-generator`, { method: 'POST', headers, body: JSON.stringify({ url: args.url }) }),
          fetch(`${origin}/api/freshness`, { method: 'POST', headers, body: JSON.stringify({ url: args.url }) }),
          fetch(`${origin}/api/backlinks`, { method: 'POST', headers, body: JSON.stringify({ url: args.url, niche: args.niche || 'general' }) })
        ])
        const [citation, schema, freshness, backlinks] = await Promise.all([
          citationRes.json(), schemaRes.json(), freshnessRes.json(), backlinksRes.json()
        ])

        return {
          seo_audit: { score: seo.score, grade: seo.grade, top_issues: seo.issues?.slice(0, 3) },
          geo_analysis: { score: geo.overall_score, top_recommendation: geo.recommendations?.[0] },
          ai_citation: { score: citation.citation_score, top_gap: citation.gaps?.[0] },
          schema: { types_generated: schema.schema_types?.join(', ') },
          freshness: { risk_level: freshness.risk_level, score: freshness.freshness_score },
          backlinks: { opportunities_found: backlinks.opportunities?.length || 0 }
        }
      }

      default:
        return { error: `Unknown tool: ${name}` }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[VoiceAgent] Tool execution failed for ${name}:`, message)
    return { error: `Tool ${name} failed: ${message}` }
  }
}

// ============================================
// MAIN POST HANDLER
// ============================================
export async function POST(request: Request) {
  // Guard: check API key before doing anything
  if (!process.env.GEMINI_API_KEY) {
    console.error('[VoiceAgent] GEMINI_API_KEY is not set in environment variables')
    return NextResponse.json({
      response: 'The voice agent is not configured yet. Please contact support.',
      conversationHistory: [],
      error: 'Agent not configured'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { message, isVisitor, conversationHistory = [], userPlan } = body

    if (!message?.trim()) {
      return NextResponse.json({
        response: 'Please say or type something.',
        conversationHistory
      })
    }

    // Auth check for dashboard mode
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuthenticated = !!user

    // Build origin — always use NEXT_PUBLIC_SITE_URL in production
    const origin = process.env.NEXT_PUBLIC_SITE_URL ||
                   `https://${request.headers.get('host')}` ||
                   'https://www.rank-mind.com'

    // Cookie forwarding for authenticated agent calls
    const cookieHeader = request.headers.get('cookie') || ''

    // System prompt based on mode
    const systemPrompt = isVisitor ? VISITOR_SYSTEM_PROMPT : DASHBOARD_SYSTEM_PROMPT

    // Available tools based on mode
    const availableTools = isVisitor
      ? RANKMIND_TOOLS.filter(t => t.name === 'run_seo_audit')
      : RANKMIND_TOOLS

    // Initialise Gemini with the stable SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ functionDeclarations: availableTools as any[] }]
    })

    // Build chat history from conversation
    const history = conversationHistory
      .filter((msg: { role: string }) => msg.role === 'user' || msg.role === 'model')
      .map((msg: { role: string; parts: { text: string }[] }) => ({
        role: msg.role,
        parts: msg.parts
      }))

    const chat = model.startChat({ history })

    // Add context about user plan if in dashboard mode
    const contextMessage = isAuthenticated && !isVisitor
      ? `[User plan: ${userPlan || 'starter'}] ${message}`
      : message

    // Send message to Gemini
    const result = await chat.sendMessage(contextMessage)
    const response = result.response

    // Check for function call
    const functionCalls = response.functionCalls()
    if (functionCalls && functionCalls.length > 0) {
      const { name, args } = functionCalls[0]

      // Log to timeline (non-blocking)
      if (isAuthenticated && user) {
        void (async () => {
          try {
            await supabase.from('timeline_events').insert({
              user_id: user.id,
              agent: 'VoiceMaster',
              action: `Called ${name}`,
              outcome: `Args: ${JSON.stringify(args)}`
            })
          } catch { /* non-critical */ }
        })()
      }

      // Execute the tool
      const toolResult = await executeTool(
        name,
        args as Record<string, string>,
        origin,
        cookieHeader
      )

      // Send tool result back to Gemini for synthesis
      const toolResultSummary = JSON.stringify(toolResult).slice(0, 3000)
      const finalResult = await chat.sendMessage([{
        functionResponse: {
          name,
          response: { result: toolResultSummary }
        }
      }])

      const spokenText = finalResult.response.text() ||
        'I completed the analysis. Please check your dashboard for the full results.'

      // Build updated conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: spokenText }] }
      ]

      return NextResponse.json({
        response: spokenText,
        toolCalled: name,
        agentAction: true,
        conversationHistory: updatedHistory
      })
    }

    // No function call — direct text response
    const spokenText = response.text() ||
      "I'm not sure how to help with that. Try asking me to analyse a website URL."

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: spokenText }] }
    ]

    return NextResponse.json({
      response: spokenText,
      conversationHistory: updatedHistory
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('[VoiceAgent] Fatal error:', message, stack)
    return NextResponse.json({
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      conversationHistory: [],
      error: process.env.NODE_ENV === 'development' ? message : 'Internal error'
    }, { status: 500 })
  }
}
