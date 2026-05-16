'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Lock, TrendingUp, Link2, Globe, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuditResult {
  domain: string;
  seoScore: number;
  crawlData: { title: string; description: string; hasHttps: boolean; h1: string; hasSchema: boolean; wordCount: number };
  quickWins: Array<{ icon: string; title: string; description: string; effort: string }>;
  keywords: Array<{ keyword: string; searches: string; position: string; opportunity: number }>;
  backlinkProspects: Array<{ type: string; example: string; da: string; relevance: string }>;
  geoVisibility: Record<string, string>;
  actionPlan: { weeks: string[]; estimatedResult: string };
}

interface Message {
  id: string;
  role: 'agent' | 'user';
  content: string;
  quickReplies?: string[];
  isTyping?: boolean;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: '-100px' }}>
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-white/50">/ 100</span>
      </div>
    </div>
  );
}

// ─── Blur Overlay ─────────────────────────────────────────────────────────────
function BlurOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(10,10,15,0.6)' }}>
      <Lock className="w-6 h-6 text-violet-400 mb-2" />
      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      <a href="#pricing"
        className="text-xs bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity">
        Start Free →
      </a>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentDemo({ initialUrl = '' }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [chatStep, setChatStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [dashboardStep, setDashboardStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start audit when initialUrl is provided
  useEffect(() => {
    if (initialUrl && !started) {
      setUrl(initialUrl);
      handleStart(initialUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const addAgentMessage = (content: string, quickReplies?: string[], delay = 1200) => {
    // Show typing indicator first
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, role: 'agent', content: '', isTyping: true }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: `msg-${Date.now()}`,
        role: 'agent',
        content,
        quickReplies,
      }));
    }, delay);
  };

  const handleStart = async (submitUrl?: string) => {
    const targetUrl = submitUrl || url;
    if (!targetUrl.trim()) return;

    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

    try { new URL(cleanUrl); } catch {
      setError('Please enter a valid website URL (e.g. yoursite.com)');
      return;
    }

    setUrl(cleanUrl);
    setStarted(true);
    setLoading(true);
    setError('');
    setMessages([]);
    setChatStep(0);
    setDashboardStep(0);
    setAuditResult(null);

    // Scroll to section
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const domain = cleanUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // Step 1 greeting immediately
    addAgentMessage(
      `Hi! I'm analysing **${domain}** right now. While I run your audit, can I ask — what's the main goal for your website?`,
      ['🛍️ Sell products or services', '📣 Generate leads', '🌐 Build brand awareness'],
      800
    );

    // Run the real API call in parallel
    try {
      const res = await fetch('/api/demo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError(data.message);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Audit failed');
      setAuditResult(data);
      setDashboardStep(1); // Show SEO score
    } catch (e) {
      setError('We couldn\'t fully analyse this site right now — showing partial results.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: reply }]);
    advanceChatStep(reply);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: inputText }]);
    advanceChatStep(inputText);
    setInputText('');
  };

  const advanceChatStep = (userReply: string) => {
    const next = chatStep + 1;
    setChatStep(next);

    if (next === 1) {
      // After goal selected
      setDashboardStep(2); // Reveal quick wins
      addAgentMessage(
        `Got it. And who are your main competitors? Name 1–2 websites you want to outrank.`,
        undefined, 1400
      );
    } else if (next === 2) {
      // After competitor entered
      setDashboardStep(3); // Reveal keywords
      addAgentMessage(
        `Perfect. One last question — are you currently running any SEO or are you starting from scratch?`,
        ['✅ We do some SEO already', '❌ Starting from zero', '🤷 Not sure'],
        1400
      );
    } else if (next === 3) {
      // After SEO status
      setDashboardStep(4); // Reveal backlinks
      addAgentMessage(
        `Great — your audit is ready. I've found some quick wins. Check your results on the right →`,
        undefined, 1400
      );
      setTimeout(() => {
        setDashboardStep(5); // Reveal GEO + action plan
        addAgentMessage(
          `Based on what you've told me, here's your personalised action plan. To start automating everything, choose a plan below.`,
          undefined, 1200
        );
      }, 3000);
    }
  };

  const effortColor = (effort: string) =>
    effort === 'Easy' ? 'text-green-400' : effort === 'Medium' ? 'text-amber-400' : 'text-red-400';
  const effortDot = (effort: string) =>
    effort === 'Easy' ? '🟢' : effort === 'Medium' ? '🟡' : '🔴';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={sectionRef} id="agent-demo" className="w-full">
      {/* Hero URL Input */}
      {!started && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Enter your website URL — e.g. yoursite.com"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 focus:bg-white/15 text-base transition-all"
            />
          </div>
          <button
            onClick={() => handleStart()}
            disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all whitespace-nowrap disabled:opacity-60 text-base"
          >
            {loading ? 'Analysing...' : 'Analyse My Site Free →'}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mt-3 max-w-2xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Demo Interface */}
      {started && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">

          {/* LEFT — Chat Panel (40%) */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: '600px', maxHeight: '700px' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                RM
              </div>
              <div>
                <p className="font-semibold text-sm text-white">RankMind Agent</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/50">Analysing your site...</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'agent' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mr-2 mt-1">
                      RM
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white' : 'bg-white/10 text-white/90'} rounded-2xl px-4 py-2.5 text-sm`}>
                    {msg.isTyping ? (
                      <div className="flex gap-1 items-center h-5">
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
                    )}
                    {msg.quickReplies && !msg.isTyping && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.quickReplies.map(r => (
                          <button key={r} onClick={() => handleQuickReply(r)}
                            className="text-xs bg-white/20 hover:bg-white/30 border border-white/20 text-white px-3 py-1.5 rounded-full transition-all">
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatStep >= 3 && (
                <div className="flex justify-center mt-4">
                  <a href="#pricing"
                    className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
                    Unlock Full Automation →
                  </a>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your answer..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button onClick={handleSendMessage}
                  className="w-10 h-10 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Live Audit Dashboard (60%) */}
          <div className="lg:col-span-3 space-y-4">

            {/* 1. SEO Score */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                SEO Score — {auditResult?.domain || url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
              </h3>
              {dashboardStep < 1 ? (
                <div className="flex items-center gap-6">
                  <Skeleton className="w-36 h-36 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ) : auditResult ? (
                <div className="flex items-center gap-6">
                  <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
                    <ScoreRing score={auditResult.seoScore} />
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    {[
                      { label: 'HTTPS Security', pass: auditResult.crawlData.hasHttps },
                      { label: 'Meta Title', pass: !!auditResult.crawlData.title },
                      { label: 'Meta Description', pass: !!auditResult.crawlData.description },
                      { label: 'H1 Heading', pass: !!auditResult.crawlData.h1 },
                      { label: 'Schema Markup', pass: auditResult.crawlData.hasSchema },
                      { label: 'Content Length', pass: auditResult.crawlData.wordCount > 300 },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.pass
                          ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        <span className={item.pass ? 'text-white/80' : 'text-white/50'}>{item.label}</span>
                        <span className={`ml-auto text-xs font-medium ${item.pass ? 'text-green-400' : 'text-red-400'}`}>
                          {item.pass ? 'Pass' : 'Fix needed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-sm">Crawling your site...</p>
              )}
            </div>

            {/* 2. Quick Wins */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Wins
              </h3>
              {dashboardStep < 2 ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : auditResult?.quickWins?.length ? (
                <div className="space-y-3">
                  {auditResult.quickWins.map((win, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                      <span className="text-xl flex-shrink-0">{win.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{win.title}</p>
                        <p className="text-xs text-white/50 mt-0.5">{win.description}</p>
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 ${effortColor(win.effort)}`}>
                        {effortDot(win.effort)} {win.effort}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { icon: '🔍', title: 'Missing meta description', description: 'Add a compelling 150-160 character meta description', effort: 'Easy' },
                    { icon: '📊', title: 'No schema markup detected', description: 'Add JSON-LD schema to improve rich snippet eligibility', effort: 'Medium' },
                    { icon: '⚡', title: 'Page speed optimisation', description: 'Compress images and enable browser caching', effort: 'Medium' },
                  ].map((win, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                      <span className="text-xl flex-shrink-0">{win.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-white">{win.title}</p>
                        <p className="text-xs text-white/50 mt-0.5">{win.description}</p>
                      </div>
                      <span className={`text-xs font-medium ${effortColor(win.effort)}`}>{effortDot(win.effort)} {win.effort}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Keywords */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Keyword Opportunities
              </h3>
              {dashboardStep < 3 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 text-xs border-b border-white/10">
                          <th className="text-left pb-2">Keyword</th>
                          <th className="text-right pb-2">Searches/mo</th>
                          <th className="text-right pb-2">Position</th>
                          <th className="text-right pb-2">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(auditResult?.keywords || []).slice(0, 5).map((kw, i) => (
                          <tr key={i} className={`border-b border-white/5 ${i >= 3 ? 'blur-sm select-none' : ''}`}>
                            <td className="py-2 text-white/80">
                              {kw.keyword}
                              {i < 2 && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Quick win</span>}
                            </td>
                            <td className="py-2 text-right text-white/60">{kw.searches}</td>
                            <td className="py-2 text-right text-white/60">{kw.position}</td>
                            <td className="py-2 text-right">
                              <span className={`font-bold ${kw.opportunity >= 80 ? 'text-green-400' : kw.opportunity >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                {kw.opportunity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {dashboardStep < 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-4"
                      style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.95) 60%, transparent)' }}>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Lock className="w-4 h-4" />
                        <a href="#pricing" className="text-violet-400 hover:underline">Unlock to see all keyword data</a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 4. Backlinks */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-400" />
                Backlink Opportunities
              </h3>
              {dashboardStep < 4 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {(auditResult?.backlinkProspects || []).slice(0, 5).map((bl, i) => (
                      <div key={i} className={`flex items-start gap-3 bg-white/5 rounded-xl p-3 ${i >= 3 ? 'blur-sm select-none' : ''}`}>
                        <Link2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-white">{bl.type}</p>
                          <p className="text-xs text-white/50">{bl.example}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">{bl.da}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dashboardStep < 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center pb-3"
                      style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.95) 60%, transparent)' }}>
                      <p className="text-xs text-white/50 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Backlink Builder automates this for you —{' '}
                        <a href="#pricing" className="text-violet-400 hover:underline">Start Free</a>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 5. GEO Visibility + Action Plan */}
            {dashboardStep >= 5 && (
              <>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    AI Search Visibility
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(auditResult?.geoVisibility || {
                      'ChatGPT': 'Not Visible',
                      'Google AI Overviews': 'Not Visible',
                      'Perplexity AI': 'Not Visible',
                      'Microsoft Copilot': 'Not Visible',
                      'Gemini': 'Not Visible',
                    }).map(([engine, status]) => (
                      <div key={engine} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                        <span className="text-sm font-medium text-white/80">{engine}</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          status === 'Partially Visible'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-3 text-center">
                    RankMind&apos;s GEO Optimizer gets you ranking in all 5 AI engines
                  </p>
                </div>

                {/* Action Plan */}
                <div className="bg-gradient-to-br from-violet-900/40 to-cyan-900/40 border border-violet-500/30 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    Your 30-Day Ranking Plan
                  </h3>
                  <div className="space-y-3 mb-4">
                    {(auditResult?.actionPlan?.weeks || [
                      'Week 1: Fix 3 on-page issues identified in your audit',
                      'Week 2: Build 10 DA40+ backlinks in your niche',
                      'Week 3: Publish 2 SEO-optimised blog posts',
                      'Week 4: GEO optimize for ChatGPT + Perplexity visibility',
                    ]).map((week, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-white/80">{week}</p>
                      </div>
                    ))}
                  </div>
                  {auditResult?.actionPlan?.estimatedResult && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 mb-4">
                      <p className="text-sm text-green-400 font-semibold">
                        📈 Estimated result: {auditResult.actionPlan.estimatedResult}
                      </p>
                    </div>
                  )}
                  <a href="#pricing"
                    className="block w-full text-center bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm">
                    Start Automating This Plan — From $29/mo →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
