import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Call 3 of 3: RESPOND ─────────────────────────────────────────────────────
// Receives the raw tool result from the frontend (returned by /execute).
// Sends it to Gemini for a concise, voice-friendly spoken synthesis.
// Returns { response, toolCalled, conversationHistory }
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 10

const SYNTHESIS_PROMPT_VISITOR = `You are Aria, the RankMind AI voice assistant.
A tool just ran and returned results. Summarise the key findings in 2-3 friendly spoken sentences (max 70 words).
Focus on the most important issue found. End with: "Sign up free to unlock the full report and all our AI-era SEO tools."`

const SYNTHESIS_PROMPT_DASHBOARD = `You are Aria, the RankMind AI voice assistant.
A tool just ran and returned results. Summarise the key findings in 3-4 spoken sentences (max 90 words).
Highlight the single most important finding and one quick win. Tell the user to check their dashboard for the full detailed report.
Never read raw JSON, field names, or long lists.`

export async function POST(request: Request) {
  const geminiKey = process.env.Gemini_API_Key || process.env.GEMINI_API_KEY
  if (!geminiKey) {
    console.error('[VoiceAgent/Respond] Gemini_API_Key is not set')
    return NextResponse.json({
      response: 'The voice agent is not configured yet.',
      error: 'Agent not configured'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const {
      toolName,
      toolResult,
      conversationHistory = [],
      isVisitor
    } = body

    if (!toolResult) {
      return NextResponse.json({
        response: 'No tool result to summarise.',
        conversationHistory
      }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(geminiKey)
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
    console.error('[VoiceAgent/Respond] Error:', msg, stack)
    return NextResponse.json({
      response: 'I completed the analysis but had trouble summarising it. Please check your dashboard for the full results.',
      conversationHistory: [],
      error: process.env.NODE_ENV === 'development' ? msg : 'Internal error'
    }, { status: 500 })
  }
}
