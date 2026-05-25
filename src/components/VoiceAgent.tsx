'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'agent'
  text: string
  agentAction?: boolean
  toolCalled?: string | null
}

interface VoiceAgentProps {
  isVisitor: boolean
  sessionUrl: string | null
  userPlan: string
}

export function VoiceAgent({ isVisitor, sessionUrl, userPlan }: VoiceAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [inputText, setInputText] = useState('')
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const greeting = isVisitor
    ? "Hi! I'm RankMind. Tell me your website URL and I'll audit it for free right now."
    : "Hey! I'm your RankMind agent. Say 'full audit' and your URL, or ask me anything about your SEO."

  // Load voices — fixes SSR voice delay
  useEffect(() => {
    if (typeof window === 'undefined') return
    synthRef.current = window.speechSynthesis

    const loadVoices = () => {
      if (!synthRef.current) return
      const voices = synthRef.current.getVoices()
      preferredVoiceRef.current =
        voices.find(v => v.name.includes('Google US English')) ||
        voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
        voices.find(v => v.lang === 'en-US' && !v.localService) ||
        voices.find(v => v.lang.startsWith('en')) ||
        null
      if (voices.length > 0) setVoicesLoaded(true)
    }

    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    loadVoices()
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Speak greeting when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'agent', text: greeting }])
      setTimeout(() => speak(greeting), 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const speak = useCallback((text: string) => {
    if (!synthRef.current || typeof window === 'undefined') return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (preferredVoiceRef.current) utterance.voice = preferredVoiceRef.current
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }, [])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return
    synthRef.current?.cancel()
    setIsSpeaking(false)
    const userMessage: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMessage])
    setIsThinking(true)

    try {
      // ── Call 1 /think: Send to Gemini, get tool decision (~2-4s) ──────────
      const thinkRes = await fetch('/api/voice-agent/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory,
          isVisitor,
          sessionUrl
        })
      })
      if (!thinkRes.ok) throw new Error(`/think error: ${thinkRes.status}`)
      const thinkData = await thinkRes.json()

      if (thinkData.type === 'tool_call') {
        // ── Call 2 /execute: Run the agent tool (~4-7s) ───────────────────
        const executeRes = await fetch('/api/voice-agent/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: thinkData.toolName,
            toolArgs: thinkData.toolArgs,
            conversationHistory: thinkData.conversationHistory,
            isVisitor,
            userId: thinkData.userId
          })
        })
        if (!executeRes.ok) throw new Error(`/execute error: ${executeRes.status}`)
        const executeData = await executeRes.json()

        // ── Call 3 /respond: Synthesise spoken response (~2-3s) ───────────
        const respondRes = await fetch('/api/voice-agent/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: thinkData.toolName,
            toolResult: executeData.result,
            conversationHistory: thinkData.conversationHistory,
            isVisitor
          })
        })
        if (!respondRes.ok) throw new Error(`/respond error: ${respondRes.status}`)
        const respondData = await respondRes.json()

        const agentMessage: Message = {
          role: 'agent',
          text: respondData.response,
          agentAction: true,
          toolCalled: thinkData.toolName
        }
        setMessages(prev => [...prev, agentMessage])
        setConversationHistory(respondData.conversationHistory || [])
        setTimeout(() => speak(respondData.response), 200)

      } else {
        // ── Direct text response — no tool needed ─────────────────────────
        const agentMessage: Message = {
          role: 'agent',
          text: thinkData.response,
          agentAction: false
        }
        setMessages(prev => [...prev, agentMessage])
        setConversationHistory(thinkData.conversationHistory || [])
        setTimeout(() => speak(thinkData.response), 200)
      }

    } catch {
      const errMsg = 'Sorry, I had a connection issue. Please try again.'
      setMessages(prev => [...prev, { role: 'agent', text: errMsg }])
      speak(errMsg)
    } finally {
      setIsThinking(false)
    }
  }, [isThinking, conversationHistory, isVisitor, sessionUrl, speak])

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      handleSend(inputText.trim())
      setInputText('')
    }
  }

  const toggleListening = useCallback(() => {
    if (isThinking) return

    if (isListening) {
      // Stop listening immediately
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    // Start listening
    const SpeechRecognition = (window as any).SpeechRecognition ||
                               (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome browser. Please use Chrome or type your message below.')
      return
    }
    synthRef.current?.cancel()
    setIsSpeaking(false)
    setTranscript('')

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => setIsListening(true)

    recognitionRef.current.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      setTranscript(text)
      // Auto-stop when speech is final
      if (result.isFinal) {
        recognitionRef.current?.stop()
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setTranscript(prev => {
        if (prev.trim()) {
          handleSend(prev.trim())
        }
        return ''
      })
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setTranscript('')
    }

    recognitionRef.current.start()
  }, [isListening, isThinking, handleSend])

  // Tool name to friendly label
  const toolLabel: Record<string, string> = {
    run_seo_audit: '🔍 Running SEO Audit...',
    run_geo_analysis: '🌐 Checking AI Visibility...',
    run_backlink_finder: '🔗 Finding Backlinks...',
    run_ai_citation_check: '📌 Checking AI Citations...',
    run_schema_generator: '🧩 Generating Schema...',
    run_content_freshness: '🌿 Checking Content Health...',
    run_full_audit: '⚡ Running All Agents...',
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Talk to RankMind Agent"
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          zIndex: 1000,
          width: 56, height: 56,
          borderRadius: '50%',
          background: isOpen
            ? '#1f2937'
            : 'linear-gradient(135deg, #7c3aed, #6366f1)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          transition: 'all 0.2s ease',
          transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {isOpen ? '✕' : '🎙️'}
      </button>

      {/* Agent Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 92, right: 24,
          zIndex: 999,
          width: 360,
          maxHeight: 540,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0
          }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0
            }}>
              🤖
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
                RankMind Agent
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                {isThinking
                  ? '⚙️ Working on it...'
                  : isSpeaking
                    ? '🔊 Speaking...'
                    : isListening
                      ? '🎙️ Listening...'
                      : isVisitor
                        ? '● Free Demo'
                        : `● ${userPlan} plan`
                }
              </div>
            </div>
            {/* Chrome notice */}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>
              Best in<br/>Chrome
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#fafafa'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {/* Show which agent ran */}
                {msg.agentAction && msg.toolCalled && (
                  <div style={{
                    fontSize: 10,
                    color: '#7c3aed',
                    marginBottom: 3,
                    fontWeight: 500
                  }}>
                    {toolLabel[msg.toolCalled] || `⚡ ${msg.toolCalled}`}
                  </div>
                )}
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  background: msg.role === 'user' ? '#7c3aed' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#111',
                  boxShadow: msg.role === 'agent' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: msg.role === 'agent' ? '1px solid #e5e7eb' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  padding: '10px 14px',
                  background: '#fff',
                  borderRadius: '12px 12px 12px 4px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7,
                      borderRadius: '50%',
                      background: '#7c3aed',
                      animation: `rmBounce 1.2s ${i * 0.15}s infinite ease-in-out`
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Live transcript while listening */}
            {isListening && transcript && (
              <div style={{
                background: '#ede9fe',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#5b21b6',
                fontStyle: 'italic',
                border: '1px solid #c4b5fd'
              }}>
                &ldquo;{transcript}&rdquo;
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Control */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid #e5e7eb',
            background: '#fff',
            flexShrink: 0
          }}>
            <button
              onClick={toggleListening}
              disabled={isThinking}
              style={{
                width: '100%',
                padding: '11px',
                background: isListening
                  ? '#dc2626'
                  : isThinking
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                cursor: isThinking ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                letterSpacing: '0.2px'
              }}
            >
              {isThinking
                ? '⚙️ Agent working...'
                : isListening
                  ? '🔴 Click to send'
                  : '🎙️ Click to speak'
              }
            </button>

            {/* Text input fallback */}
            <form onSubmit={handleTextSubmit} style={{
              display: 'flex',
              gap: 8,
              marginTop: 8
            }}>
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Or type here..."
                disabled={isThinking}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e5e7eb',
                  fontSize: 13,
                  outline: 'none',
                  background: isThinking ? '#f9fafb' : '#fff',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="submit"
                disabled={isThinking || !inputText.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  cursor: isThinking || !inputText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  opacity: isThinking || !inputText.trim() ? 0.5 : 1,
                  transition: 'opacity 0.15s'
                }}
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rmBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
