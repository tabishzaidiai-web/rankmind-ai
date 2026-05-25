import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

// ─── Vercel Hobby: 10s max — this route must complete in < 8s ─────────────────
// Call 1 of 2: Send user message to Gemini, get tool decision back.
// NO tool execution happens here. Returns either:
//   { type: 'tool',   toolName, toolArgs, conversationHistory }
//   { type: 'direct', response, conversationHistory }
// The frontend then calls /api/voice-agent/execute for tool calls.
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 8

// ── Tool declarations (schema only — no execution here) ──────────────────────
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
    description: 'Checks how well the website content is structured to be cited by AI systems like ChatGPT and Perplexity. Returns citation readiness score, E-E-A-T score, semantic completeness score, and specific gaps to fill.',
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

// ── System prompts ────────────────────────────────────────────────────────────
const VISITOR_SYSTEM_PROMPT = `You are Aria, the RankMind AI voice assistant. You help website owners improve their SEO and AI search visibility.

You are speaking to a visitor who has NOT signed up yet. You can run ONE tool: run_seo_audit.

Rules:
- Be friendly, concise, and conversational. Speak like a helpful expert, not a robot.
- When a user gives you a URL, immediately call run_seo_audit with it.
- After the audit, give a 2-3 sentence spoken summary of the top findings.
- Then say: "Sign up free to unlock the full report, GEO visibility score, backlink finder, and more."
- Keep all responses under 80 words — this will be spoken aloud.
- Never mention JSON, scores as raw numbers, or technical jargon.`

const DASHBOARD_SYSTEM_PROMPT = `You are Aria, the RankMind AI voice assistant — a powerful SEO and AI search expert.

You are speaking to a logged-in RankMind user inside their dashboard. You have access to all 7 agents.

Rules:
- Be direct, expert, and efficient. The user is a paying customer.
- When a user gives a URL or asks to analyse something, immediately call the appropriate tool.
- For "full audit" or "analyse everything" requests, call run_full_audit.
- After any tool call, give a spoken summary in 3-4 sentences. Highlight the most important finding.
- Tell the user to check their dashboard for the full detailed report.
- Keep all responses under 100 words — this will be spoken aloud.
- Never read out raw JSON, long lists, or technical field names.`

// ── Main handler: Call 1 ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('[VoiceAgent/Call1] GEMINI_API_KEY is not set')
    return NextResponse.json({
      type: 'direct',
      response: 'The voice agent is not configured yet. Please add your GEMINI_API_KEY to Vercel environment variables.',
      conversationHistory: [],
      error: 'Agent not configured'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { message, isVisitor, conversationHistory = [], userPlan } = body

    if (!message?.trim()) {
      return NextResponse.json({
        type: 'direct',
        response: 'Please say or type something.',
        conversationHistory
      })
    }

    // Auth check for dashboard mode
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuthenticated = !!user

    // System prompt and tools based on mode
    const systemPrompt = isVisitor ? VISITOR_SYSTEM_PROMPT : DASHBOARD_SYSTEM_PROMPT
    const availableTools = isVisitor
      ? RANKMIND_TOOLS.filter(t => t.name === 'run_seo_audit')
      : RANKMIND_TOOLS

    // Initialise Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ functionDeclarations: availableTools as any[] }]
    })

    // Build chat history (user/model turns only)
    const history = conversationHistory
      .filter((msg: { role: string }) => msg.role === 'user' || msg.role === 'model')
      .map((msg: { role: string; parts: { text: string }[] }) => ({
        role: msg.role,
        parts: msg.parts
      }))

    const chat = model.startChat({ history })

    // Add plan context for dashboard users
    const contextMessage = isAuthenticated && !isVisitor
      ? `[User plan: ${userPlan || 'starter'}] ${message}`
      : message

    // ── Send to Gemini — ONLY get the decision, do NOT execute ──────────────
    const result = await chat.sendMessage(contextMessage)
    const response = result.response
    const functionCalls = response.functionCalls()

    if (functionCalls && functionCalls.length > 0) {
      const { name, args } = functionCalls[0]

      // Build updated history including this turn (tool call pending)
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', parts: [{ text: message }] }
        // model turn will be added after execution in Call 2
      ]

      // Return tool decision to frontend — no execution here
      return NextResponse.json({
        type: 'tool',
        toolName: name,
        toolArgs: args,
        conversationHistory: updatedHistory,
        isAuthenticated,
        userId: user?.id || null
      })
    }

    // ── Direct text response (no tool needed) ────────────────────────────────
    const spokenText = response.text() ||
      "I'm not sure how to help with that. Try asking me to analyse a website URL."

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: spokenText }] }
    ]

    return NextResponse.json({
      type: 'direct',
      response: spokenText,
      conversationHistory: updatedHistory
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('[VoiceAgent/Call1] Error:', msg, stack)
    return NextResponse.json({
      type: 'direct',
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      conversationHistory: [],
      error: process.env.NODE_ENV === 'development' ? msg : 'Internal error'
    }, { status: 500 })
  }
}
