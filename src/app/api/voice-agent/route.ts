import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai'

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// ============================================
// TOOL DEFINITIONS — Your existing agents as Gemini tools
// ============================================
const RANKMIND_TOOLS: FunctionDeclaration[] = [
  {
    name: 'run_seo_audit',
    description: 'Runs a full SEO audit on a website. Checks title tag, meta description, H1, HTTPS, page speed, mobile friendliness, schema markup, canonical tags, content depth, and image alt text. Returns a score out of 100, a letter grade, specific issues found, and quick wins.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The full website URL to analyse' }
      },
      required: ['url']
    }
  },
  {
    name: 'run_backlink_finder',
    description: 'Finds real backlink opportunities for a website. Searches the web for guest post sites, contributor blogs, and resource pages in the same niche. Returns prospects with domain authority scores and ready-to-send outreach email templates.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The website URL' },
        niche: {
          type: Type.STRING,
          description: 'The business niche or industry. Examples: digital marketing, e-commerce fashion, SaaS project management, plumbing services, accounting software'
        }
      },
      required: ['url', 'niche']
    }
  },
  {
    name: 'run_ai_citation_check',
    description: 'Checks how well the website content is structured to be cited by AI systems like ChatGPT and Perplexity when answering user questions. Returns citation readiness score, E-E-A-T score, semantic completeness score, and specific gaps to fill.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The website URL to check' }
      },
      required: ['url']
    }
  },
  {
    name: 'run_schema_generator',
    description: 'Generates JSON-LD structured data schema markup for the website. Helps Google display rich results like star ratings, FAQs, prices, and business info in search results.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The website URL' },
        page_type: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The website URL' }
      },
      required: ['url']
    }
  },
  {
    name: 'run_full_audit',
    description: 'Runs ALL agents in sequence — SEO audit, GEO analysis, AI citation check, schema generation, content freshness, and backlink finder. Use this when the user wants a complete analysis or says things like "analyse everything", "full audit", "check my whole site", or "run all agents".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The website URL' },
        niche: {
          type: Type.STRING,
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
const VISITOR_SYSTEM_PROMPT = `You are RankMind — a friendly, expert SEO voice agent on the RankMind AI website.

You are talking to a VISITOR who has not yet signed up. Your job is to:
1. Impress them with a real, fast SEO analysis of their website
2. Show them exactly what problems their site has
3. Convince them to sign up to fix those problems automatically

YOUR PERSONALITY:
- Warm, confident, and direct — like a senior SEO consultant
- Speak in short sentences under 15 words each — this is voice output
- Never use markdown, bullet points, asterisks, or formatting
- Sound human and conversational, not robotic

YOUR RULES:
- You can ONLY run the SEO audit tool for visitors — no backlinks, GEO, or other agents
- Always ask for the website URL if not provided
- Confirm the URL before running: "Let me analyse example.com right now"
- After getting results, speak the score and top 2 issues only
- Always end with: "Want me to automatically fix all of this? Sign up free — it takes 30 seconds"
- Keep every response under 60 words

EXAMPLE GOOD RESPONSE:
"I just audited shopify.com. They score 90 out of 100. The main issue is the meta description is slightly long at 179 characters. Google is trimming it in search results. Want me to find and fix all issues on your site automatically? Sign up free — it takes 30 seconds."

EXAMPLE BAD RESPONSE (never do this):
"Here are the results: • HTTPS: 100/100 • Title Tag: 70/100 • Meta Description: 65/100" (never use bullet points or numbers like this in voice)`

const DASHBOARD_SYSTEM_PROMPT = (userEmail: string, plan: string) =>
`You are the RankMind AI Master Agent — a powerful, autonomous SEO and GEO agent working exclusively for ${userEmail}.

You have FULL access to all 7 specialist agents and you decide which ones to run and in what order.

YOUR PERSONALITY:
- Confident, proactive, and action-oriented — you are a senior SEO director
- Speak in short sentences under 15 words each — this is voice output
- Never use markdown, bullet points, asterisks, or symbols
- After completing each agent task, immediately suggest the next logical step
- You are proactive — if SEO audit reveals backlink issues, you offer to run LinkBot next

YOUR AGENTS:
- RankBot: SEO audit — technical on-page analysis
- GEO-G: AI visibility — ChatGPT, Perplexity, Google AI Overviews
- LinkBot: Backlink finder — real prospects with outreach emails
- CitationBot: AI citation readiness — E-E-A-T and semantic completeness
- SchemaBot: JSON-LD schema generator — rich results in Google
- FreshnessBot: Content decay analysis — 12-week refresh plan
- Full Audit: Runs all agents in sequence automatically

CURRENT USER PLAN: ${plan}
${plan === 'starter' ? 'Note: This user is on Starter plan. Do not offer backlink finding — it requires Growth plan.' : ''}

YOUR RULES:
- Always confirm the URL before running any tool
- After each agent completes, summarise in 2-3 short spoken sentences
- Always suggest the next logical agent: "Want me to check your AI visibility next?"
- If user says "run everything" or "full audit" → call run_full_audit immediately
- Keep every response under 80 words
- Remember context across the conversation — if they mentioned a URL earlier, use it

EXAMPLE FLOW:
User: "Check my website"
You: "What is your website URL?"
User: "rank-mind.com"
You: "Running the full SEO audit on rank-mind.com now. Give me 15 seconds."
[calls run_seo_audit]
You: "Done. Rank-mind scores 73 out of 100, grade B. The headings structure needs work and you have no FAQ schema. Want me to generate the schema markup automatically?"`

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const {
    message,
    conversationHistory = [],
    isVisitor = false,
    sessionUrl = null
  } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const isAuthenticated = !!user
  const useVisitorMode = isVisitor || !isAuthenticated

  let plan = 'starter'
  let userEmail = 'visitor'

  if (isAuthenticated && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan_name, subscription_status')
      .eq('id', user.id)
      .single()
    plan = userData?.plan_name || 'starter'
    userEmail = user.email || 'user'
  }

  const systemPrompt = useVisitorMode
    ? VISITOR_SYSTEM_PROMPT
    : DASHBOARD_SYSTEM_PROMPT(userEmail, plan)

  const contextMessage = sessionUrl
    ? `${message} (The user already entered this URL in the demo: ${sessionUrl})`
    : message

  const contents = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: contextMessage }] }
  ]

  // Visitors only get the SEO audit tool
  const availableTools = useVisitorMode
    ? RANKMIND_TOOLS.filter(t => t.name === 'run_seo_audit')
    : RANKMIND_TOOLS

  // First Gemini call — decides what to do
  let response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: availableTools }]
    }
  })

  const candidate = response.candidates?.[0]
  const functionCall = candidate?.content?.parts?.find((p: any) => p.functionCall)

  if (functionCall?.functionCall) {
    const { name, args = {} } = functionCall.functionCall

    // Log the agentic action to timeline
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

    const origin = request.headers.get('origin') ||
                   process.env.NEXT_PUBLIC_SITE_URL ||
                   'http://localhost:3000'
    const cookieHeader = request.headers.get('cookie') || ''

    let toolResult: any = {}

    try {
      if (name === 'run_seo_audit') {
        const res = await fetch(`${origin}/api/seo-audit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url })
        })
        toolResult = await res.json()

      } else if (name === 'run_geo_analysis') {
        const res = await fetch(`${origin}/api/geo-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url })
        })
        toolResult = await res.json()

      } else if (name === 'run_backlink_finder') {
        const res = await fetch(`${origin}/api/backlinks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url, niche: args.niche })
        })
        toolResult = await res.json()

      } else if (name === 'run_ai_citation_check') {
        const res = await fetch(`${origin}/api/ai-citation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url })
        })
        toolResult = await res.json()

      } else if (name === 'run_schema_generator') {
        const res = await fetch(`${origin}/api/schema-generator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url, pageType: args.page_type || 'auto' })
        })
        toolResult = await res.json()

      } else if (name === 'run_content_freshness') {
        const res = await fetch(`${origin}/api/freshness`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ url: args.url })
        })
        toolResult = await res.json()

      } else if (name === 'run_full_audit') {
        // Run all agents in parallel for speed
        const [seo, geo, citation, schema, freshness] = await Promise.allSettled([
          fetch(`${origin}/api/seo-audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
            body: JSON.stringify({ url: args.url })
          }).then(r => r.json()),
          fetch(`${origin}/api/geo-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
            body: JSON.stringify({ url: args.url })
          }).then(r => r.json()),
          fetch(`${origin}/api/ai-citation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
            body: JSON.stringify({ url: args.url })
          }).then(r => r.json()),
          fetch(`${origin}/api/schema-generator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
            body: JSON.stringify({ url: args.url, pageType: 'auto' })
          }).then(r => r.json()),
          fetch(`${origin}/api/freshness`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
            body: JSON.stringify({ url: args.url })
          }).then(r => r.json()),
        ])

        toolResult = {
          seo_audit: seo.status === 'fulfilled' ? seo.value : { error: 'failed' },
          geo_analysis: geo.status === 'fulfilled' ? geo.value : { error: 'failed' },
          ai_citation: citation.status === 'fulfilled' ? citation.value : { error: 'failed' },
          schema: schema.status === 'fulfilled' ? schema.value : { error: 'failed' },
          freshness: freshness.status === 'fulfilled' ? freshness.value : { error: 'failed' },
        }
      }
    } catch (err) {
      toolResult = { error: 'Tool call failed', details: String(err) }
    }

    // Second Gemini call — synthesise tool result into a voice-friendly response
    const toolResultSummary = JSON.stringify(toolResult).slice(0, 3000) // cap to avoid token overflow

    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...contents,
        { role: 'model', parts: [{ functionCall: { name, args } }] },
        {
          role: 'tool',
          parts: [{
            functionResponse: {
              name,
              response: { result: toolResultSummary }
            }
          }]
        }
      ],
      config: {
        systemInstruction: systemPrompt
      }
    })

    const finalText = finalResponse.candidates?.[0]?.content?.parts
      ?.filter((p: any) => p.text)
      ?.map((p: any) => p.text)
      ?.join(' ')
      ?.trim() || 'I completed the analysis. Please check your dashboard for the full results.'

    // Build updated conversation history for the client
    const updatedHistory = [
      ...contents,
      { role: 'model', parts: [{ text: finalText }] }
    ]

    return NextResponse.json({
      response: finalText,
      toolCalled: name,
      agentAction: true,
      conversationHistory: updatedHistory
    })
  }

  // No tool call — just a conversational response
  const textResponse = candidate?.content?.parts
    ?.filter((p: any) => p.text)
    ?.map((p: any) => p.text)
    ?.join(' ')
    ?.trim() || "I'm here to help with your SEO. What would you like to analyse?"

  const updatedHistory = [
    ...contents,
    { role: 'model', parts: [{ text: textResponse }] }
  ]

  return NextResponse.json({
    response: textResponse,
    toolCalled: null,
    agentAction: false,
    conversationHistory: updatedHistory
  })
}
