'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Lock, TrendingUp, Link2, Globe, Zap, CheckCircle, AlertCircle, Clock, Shield, Smartphone, FileText, Code, ArrowRight } from 'lucide-react';

interface VisibleMetric { score: number; label: string; detail: string; }
interface Issue { severity: string; issue: string; detail: string; fix: string; }
interface AuditResult {
  success: boolean; url: string; title: string | null; overallScore: number; grade: string;
  summary: string; remaining: number;
  visibleMetrics: { https: VisibleMetric; title: VisibleMetric; metaDescription: VisibleMetric; mobile: VisibleMetric; };
  lockedMetrics: { speed: number; h1: number; imageAlt: number; schema: number; canonical: number; content: number; };
  topIssues: Issue[]; lockedIssueCount: number; wins: string[]; wordCount: number; imageCount: number; responseTimeMs: number;
}
interface Message { id: string; role: 'agent' | 'user'; content: string; quickReplies?: string[]; isTyping?: boolean; }

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const radius = 54, circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg width="140" height="140" className="-rotate-90 absolute inset-0">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-white/50">/ 100</span>
        <span className="text-sm font-bold" style={{ color }}>Grade {grade}</span>
      </div>
    </div>
  );
}

function MetricBar({ score, label, detail, icon }: { score: number; label: string; detail: string; icon: React.ReactNode }) {
  const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2"><span className="text-white/60">{icon}</span><span className="text-xs font-medium text-white/80">{label}</span></div>
        <span className={`text-xs font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
        <div className={`h-1.5 rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-white/40 truncate">{detail}</p>
    </div>
  );
}

function BlurOverlay({ label, signupUrl }: { label: string; signupUrl: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(10,10,15,0.6)' }}>
      <Lock className="w-6 h-6 text-violet-400 mb-2" />
      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      <a href={signupUrl} className="text-xs bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity">
        Start Free →
      </a>
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />;
}

export default function AgentDemo({ initialUrl = '' }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [chatStep, setChatStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [dashboardStep, setDashboardStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (initialUrl && !started) { setUrl(initialUrl); handleStart(initialUrl); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const addAgentMessage = (content: string, quickReplies?: string[], delay = 1200) => {
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, role: 'agent', content: '', isTyping: true }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({ id: `msg-${Date.now()}`, role: 'agent', content, quickReplies }));
    }, delay);
  };

  const handleStart = async (submitUrl?: string) => {
    const targetUrl = submitUrl || url;
    if (!targetUrl.trim()) { setError('Please enter your website URL to get a free SEO audit.'); return; }
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    try { new URL(cleanUrl); } catch { setError('Please enter a valid website URL (e.g. yoursite.com)'); return; }
    setUrl(cleanUrl); setStarted(true); setLoading(true); setError('');
    setMessages([]); setChatStep(0); setDashboardStep(0); setAuditResult(null); setRateLimited(false);
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    const domain = cleanUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    addAgentMessage(`Hi! I'm analysing **${domain}** right now. While I run your audit, what's the main goal for your website?`,
      ['🛍️ Sell products or services', '📣 Generate leads', '🌐 Build brand awareness'], 800);
    try {
      const res = await fetch('/api/demo-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: cleanUrl }) });
      const data = await res.json();
      if (data.rateLimited) { setRateLimited(true); setLoading(false); return; }
      if (res.status === 422) { setError(data.message || "We couldn't reach this website. Please check the URL."); setLoading(false); setStarted(false); return; }
      if (!res.ok) throw new Error(data.message || 'Audit failed');
      setAuditResult(data); setDashboardStep(1);
    } catch { setError("We couldn't fully analyse this site right now. Please try again."); setStarted(false); }
    finally { setLoading(false); }
  };

  const handleQuickReply = (reply: string) => {
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: reply }]);
    advanceChatStep();
  };
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: inputText }]);
    advanceChatStep(); setInputText('');
  };
  const advanceChatStep = () => {
    const next = chatStep + 1; setChatStep(next);
    if (next === 1) { setDashboardStep(2); addAgentMessage(`Got it. Who are your main competitors? Name 1–2 websites you want to outrank.`, undefined, 1400); }
    else if (next === 2) { setDashboardStep(3); addAgentMessage(`Perfect. Are you currently running any SEO or starting from scratch?`, ['✅ We do some SEO already', '❌ Starting from zero', '🤷 Not sure'], 1400); }
    else if (next === 3) {
      setDashboardStep(4); addAgentMessage(`Great — your full audit is ready. Check your results on the right →`, undefined, 1400);
      setTimeout(() => { setDashboardStep(5); addAgentMessage(`Here's your personalised 30-day action plan. To automate everything, choose a plan below.`, undefined, 1200); }, 3000);
    }
  };

  const signupUrl = `/signup?url=${encodeURIComponent(url)}`;

  // Navigate to dashboard if logged in, else to signup
  const handleViewFullAudit = () => {
    const hasSession = typeof document !== 'undefined' &&
      (document.cookie.includes('sb-') || document.cookie.includes('supabase-auth'));
    const dest = hasSession
      ? `/dashboard/seo-audit?url=${encodeURIComponent(url)}`
      : `/signup?url=${encodeURIComponent(url)}`;
    window.location.href = dest;
  };

  return (
    <div ref={sectionRef} id="agent-demo" className="w-full">
      {!started && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Enter your website URL — e.g. yoursite.com"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 focus:bg-white/15 text-base transition-all" />
          </div>
          <button onClick={() => handleStart()} disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all whitespace-nowrap disabled:opacity-60 text-base">
            {loading ? 'Analysing...' : 'Analyse My Site Free →'}
          </button>
        </div>
      )}
      {!started && error && (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      )}

      {rateLimited && (
        <div className="mt-6 max-w-2xl mx-auto bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You&apos;ve used your 3 free audits today</h3>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">Sign up free to run unlimited audits, track your score over time, and get weekly automated reports.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={signupUrl} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all text-sm">
              Start Free — No Credit Card →
            </a>
            <button onClick={() => { setStarted(false); setRateLimited(false); setUrl(''); }} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm">
              Try a different URL
            </button>
          </div>
          <p className="text-white/30 text-xs mt-4">Free plan includes 10 audits/month &bull; No credit card required</p>
        </div>
      )}

      {!rateLimited && error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-4 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          {started && <button onClick={() => { setStarted(false); setError(''); }} className="ml-auto text-xs text-white/50 hover:text-white underline">Try again</button>}
        </div>
      )}

      {started && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
          {/* LEFT — Chat Panel */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col" style={{ height: '620px' }}>
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">R</div>
              <div><p className="text-sm font-semibold text-white">RankBot</p><p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />Analysing your site...</p></div>
              <button onClick={() => { setStarted(false); setAuditResult(null); setUrl(''); }} className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors">✕ New audit</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-br-sm' : 'bg-white/10 text-white/90 rounded-bl-sm'}`}>
                    {msg.isTyping ? (
                      <div className="flex gap-1 py-1">
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                    {msg.quickReplies && !msg.isTyping && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.quickReplies.map(r => (
                          <button key={r} onClick={() => handleQuickReply(r)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1 transition-colors text-white/80">{r}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatStep >= 3 && (
                <div className="flex justify-center mt-4">
                  <a href={signupUrl} className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">Unlock Full Automation →</a>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a reply or pick an option above..." className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-all" />
                <button onClick={handleSendMessage} className="w-10 h-10 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-white/25 mt-1.5 text-center">Press Enter to send · or click a quick reply above</p>
            </div>
          </div>

          {/* RIGHT — Live Dashboard */}
          <div className="lg:col-span-3 space-y-4 overflow-y-auto" style={{ maxHeight: '620px' }}>
            {/* SEO Score */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                SEO Score — {auditResult?.url?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
              </h3>
              <p className="text-xs text-amber-400/80 mb-4 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Free preview: showing 4 of 10+ SEO factors — <a href={signupUrl} className="underline hover:text-amber-300">upgrade to see all</a>
              </p>
              {dashboardStep < 1 ? (
                <div className="flex items-center gap-6"><Skeleton className="w-36 h-36 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /></div></div>
              ) : auditResult ? (
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <ScoreRing score={auditResult.overallScore} grade={auditResult.grade} />
                    <div className="flex-1 space-y-2 min-w-0">
                      <MetricBar score={auditResult.visibleMetrics.https.score} label={auditResult.visibleMetrics.https.label} detail={auditResult.visibleMetrics.https.detail} icon={<Shield className="w-3.5 h-3.5" />} />
                      <MetricBar score={auditResult.visibleMetrics.title.score} label={auditResult.visibleMetrics.title.label} detail={auditResult.visibleMetrics.title.detail} icon={<FileText className="w-3.5 h-3.5" />} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <MetricBar score={auditResult.visibleMetrics.metaDescription.score} label={auditResult.visibleMetrics.metaDescription.label} detail={auditResult.visibleMetrics.metaDescription.detail} icon={<FileText className="w-3.5 h-3.5" />} />
                    <MetricBar score={auditResult.visibleMetrics.mobile.score} label={auditResult.visibleMetrics.mobile.label} detail={auditResult.visibleMetrics.mobile.detail} icon={<Smartphone className="w-3.5 h-3.5" />} />
                  </div>
                  {auditResult.summary && (
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-violet-300 font-semibold mb-1">RankBot Analysis</p>
                      <p className="text-sm text-white/80 leading-relaxed">{auditResult.summary}</p>
                    </div>
                  )}
                  {auditResult.wins.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {auditResult.wins.map((win, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{win}</div>
                      ))}
                    </div>
                  )}
                  {/* Dashboard CTA — appears immediately after audit result loads */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-xl">
                    <p className="text-xs text-white/60 mb-2">Want the full 10-factor audit, keyword tracking &amp; PDF report?</p>
                    <button
                      onClick={handleViewFullAudit}
                      className="flex items-center gap-2 w-full justify-center bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm"
                    >
                      View Full Audit in Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : <p className="text-white/40 text-sm">Crawling your site...</p>}
            </div>

            {/* Issues */}
            {dashboardStep >= 2 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" />Issues Found</h3>
                {auditResult?.topIssues?.length ? (
                  <div className="space-y-3">
                    {auditResult.topIssues.map((issue, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 border-l-2 border-red-500/60">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{issue.severity}</span>
                          <p className="text-sm font-semibold text-white">{issue.issue}</p>
                        </div>
                        <p className="text-xs text-white/50 mb-1">{issue.detail}</p>
                        <p className="text-xs text-violet-400">Fix: {issue.fix}</p>
                      </div>
                    ))}
                    {auditResult.lockedIssueCount > 0 && (
                      <div className="relative">
                        <div className="bg-white/5 rounded-xl p-3 border-l-2 border-white/10 opacity-40 select-none">
                          <p className="text-sm font-semibold text-white">+{auditResult.lockedIssueCount} more issues found</p>
                          <p className="text-xs text-white/50">Sign up to see all issues and automated fixes</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backdropFilter: 'blur(4px)', background: 'rgba(10,10,15,0.5)' }}>
                          <a href={signupUrl} className="flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300"><Lock className="w-4 h-4" />Unlock {auditResult.lockedIssueCount} more issues →</a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>}
              </div>
            )}

            {/* Locked Metrics */}
            {dashboardStep >= 3 && auditResult && (
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Full Technical Audit (6 more checks)</h3>
                <div className="grid grid-cols-2 gap-2 select-none">
                  {[
                    { label: 'Page Speed', score: auditResult.lockedMetrics.speed, icon: <Clock className="w-3.5 h-3.5" /> },
                    { label: 'H1 Heading', score: auditResult.lockedMetrics.h1, icon: <FileText className="w-3.5 h-3.5" /> },
                    { label: 'Image Alt Text', score: auditResult.lockedMetrics.imageAlt, icon: <Globe className="w-3.5 h-3.5" /> },
                    { label: 'Schema Markup', score: auditResult.lockedMetrics.schema, icon: <Code className="w-3.5 h-3.5" /> },
                  ].map(m => (
                    <div key={m.label} className="bg-white/5 rounded-xl p-3 opacity-50">
                      <div className="flex items-center justify-between mb-1"><span className="text-xs text-white/60 flex items-center gap-1">{m.icon}{m.label}</span><span className="text-xs font-bold text-white/40">{m.score}/100</span></div>
                      <div className="w-full bg-white/10 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-white/20" style={{ width: `${m.score}%` }} /></div>
                    </div>
                  ))}
                </div>
                <BlurOverlay label="Unlock full technical audit" signupUrl={signupUrl} />
              </div>
            )}

            {/* Backlinks — honest paid-feature teaser */}
            {dashboardStep >= 4 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Link2 className="w-4 h-4 text-teal-400" />Backlink Opportunities</h3>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                  LinkBot uses live web search to find real high-authority websites in your niche — then writes personalised outreach emails automatically. Results are specific to your website and industry.
                </p>
                <a href={signupUrl} className="inline-flex items-center gap-2 text-sm text-teal-400 font-medium hover:text-teal-300 transition-colors">
                  Unlock real backlink finder &rarr;
                </a>
                <p className="text-xs text-white/30 mt-2">Available on Growth and Enterprise plans</p>
              </div>
            )}

            {/* Action Plan */}
            {dashboardStep >= 5 && (
              <div className="bg-gradient-to-br from-violet-900/40 to-cyan-900/40 border border-violet-500/30 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-violet-400" />Your 30-Day Ranking Plan</h3>
                <div className="space-y-3 mb-4">
                  {['Week 1: Fix the critical issues found in your audit above', 'Week 2: Build 10 DA40+ backlinks in your niche', 'Week 3: Publish 2 SEO-optimised blog posts targeting your keywords', 'Week 4: GEO optimize for ChatGPT + Perplexity AI visibility'].map((week, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-white/80">{week}</p>
                    </div>
                  ))}
                </div>
                <a href={signupUrl} className="block w-full text-center bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm">
                  Start Automating This Plan — From $5/mo →
                </a>
                {auditResult && <p className="text-center text-xs text-white/30 mt-2">{auditResult.remaining} free audit{auditResult.remaining !== 1 ? 's' : ''} remaining today</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
