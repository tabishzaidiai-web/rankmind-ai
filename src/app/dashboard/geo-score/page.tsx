'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Search, AlertCircle, Loader2, ChevronDown, ChevronUp, Zap, BookOpen, BarChart3, FileText, ArrowRight } from 'lucide-react';

const WHATS_NEXT_GEO = [
  {
    href: '/dashboard/content',
    avatar: '/agent-contentai-transparent.png',
    name: 'ContentAI',
    desc: 'Create AI-optimised content to close the gaps found in this analysis',
    glow: 'rgba(245,158,11,0.35)',
    color: '#d97706',
    border: 'border-amber-500/30',
  },
  {
    href: '/dashboard/backlinks',
    avatar: '/agent-linkbot-transparent.png',
    name: 'LinkBot',
    desc: 'Find more backlinks to strengthen your topical authority score',
    glow: 'rgba(13,148,136,0.35)',
    color: '#0d9488',
    border: 'border-teal-500/30',
  },
];

interface GEOAnalysis {
  url: string;
  analyzed_at: string;
  geo_score: number;
  ai_visibility: {
    chatgpt_score: number;
    perplexity_score: number;
    gemini_score: number;
    google_ai_mode_score?: number;
    semantic_completeness_score?: number;
    entity_density_score?: number;
    eeat_score?: number;
    ai_mode_citation_readiness?: string;
    overall: number;
    strengths: string[];
    weaknesses: string[];
  };
  content_gaps: Array<{
    topic: string;
    importance: number;
    suggested_content: string;
    search_intent: string;
  }>;
  schema_recommendations: Array<{
    type: string;
    priority: string;
    description: string;
    example?: string;
  }>;
  topical_authority: {
    score: number;
    covered_topics: string[];
    missing_topics: string[];
    recommendation: string;
  };
  weekly_content_plan: Array<{
    week: number;
    title: string;
    type: string;
    target_keywords: string[];
    estimated_impact: string;
  }>;
  action_plan: Array<{
    priority: string;
    action: string;
    impact: string;
    timeline: string;
  }>;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="font-bold text-white">{score}/100</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ProgressStep({ label, delay, color = 'text-blue-400' }: { label: string; delay: number; color?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-white/60 animate-in fade-in slide-in-from-left-2 duration-300">
      <Loader2 className={`w-3.5 h-3.5 animate-spin ${color} flex-shrink-0`} />
      {label}
    </div>
  );
}

export default function GEOScorePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GEOAnalysis | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>('visibility');

  // Pre-fill URL from saved website
  useEffect(() => {
    const prefillUrl = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: website } = await supabase
          .from('websites')
          .select('url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        if (website?.url) setUrl(website.url);
      } catch { /* no website saved yet */ }
    };
    prefillUrl();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/geo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'GEO analysis failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (s: string) => setExpanded(expanded === s ? null : s);

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
  const barColor = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full space-y-6">
      <style>{`@keyframes floatAgent{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-20" style={{background:'radial-gradient(circle,#2563eb 0%,transparent 70%)',zIndex:0}} />

      {/* ── Top section: form (left) + avatar (right) ── */}
      <div className="flex items-start gap-8 relative z-10">
        {/* LEFT: title + form */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white mb-1">GEO Optimizer</h1>
          <p className="text-white/50 text-sm mb-5">Optimize for ChatGPT, Perplexity, Gemini, and all AI search engines</p>

          <form onSubmit={handleAnalyze} className="bg-white/5 border border-blue-500/20 rounded-2xl p-5">
            <label className="block text-sm font-medium text-white/70 mb-2">Website URL to Analyze</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Analyze GEO Score'}
              </button>
            </div>
            {loading && (
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Crawling website & extracting content signals', delay: 0 },
                  { label: 'Scoring ChatGPT & Perplexity visibility', delay: 700 },
                  { label: 'Identifying content gaps & topical authority', delay: 1600 },
                  { label: 'Building 4-week content plan', delay: 2600 },
                ].map((step, i) => (
                  <ProgressStep key={i} label={step.label} delay={step.delay} color="text-blue-400" />
                ))}
              </div>
            )}
          </form>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results placeholder */}
          {!result && !loading && (
            <div className="mt-5 border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-blue-400/60" />
              </div>
              <p className="text-white/40 text-sm font-medium">Your GEO analysis will appear here</p>
              <p className="text-white/25 text-xs max-w-xs">Enter your website URL above to check your AI visibility score across ChatGPT, Perplexity, and Gemini.</p>
            </div>
          )}
        </div>

        {/* RIGHT: floating GEO-G avatar */}
        <div className="hidden md:flex flex-col items-center justify-start pt-2 flex-shrink-0 w-52">
          <div style={{animation:'floatAgent 3s ease-in-out infinite',filter:'drop-shadow(0 0 30px rgba(37,99,235,0.5))'}}>
            <Image src="/agent-geog-transparent.png" alt="GEO-G" width={200} height={200} className="w-44 h-44 object-contain" />
          </div>
          <span className="text-sm font-semibold text-blue-300 mt-2">GEO-G</span>
          <span className="text-xs text-white/40">GEO Optimizer</span>
        </div>
      </div>

      {/* ── Results (full width) ── */}
      {result && (
        <div className="space-y-4">
          {/* GEO Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-6xl font-black ${scoreColor(result.geo_score)}`}>{result.geo_score}</div>
                <div className="text-xs text-white/40 mt-1">GEO Score</div>
              </div>
              <div className="flex-1 space-y-3">
                {result.ai_visibility && (
                  <>
                    <ScoreBar label="ChatGPT Search" score={result.ai_visibility.chatgpt_score} color={barColor(result.ai_visibility.chatgpt_score)} />
                    <ScoreBar label="Perplexity" score={result.ai_visibility.perplexity_score} color={barColor(result.ai_visibility.perplexity_score)} />
                    <ScoreBar label="Gemini" score={result.ai_visibility.gemini_score} color={barColor(result.ai_visibility.gemini_score)} />
                    <ScoreBar label="Google AI Mode" score={result.ai_visibility.google_ai_mode_score ?? result.ai_visibility.gemini_score} color={barColor(result.ai_visibility.google_ai_mode_score ?? result.ai_visibility.gemini_score)} />
                    <ScoreBar label="Semantic Completeness" score={(result.ai_visibility.semantic_completeness_score ?? 7) * 10} color={barColor((result.ai_visibility.semantic_completeness_score ?? 7) * 10)} />
                    <ScoreBar label="Entity Density" score={result.ai_visibility.entity_density_score ?? 60} color={barColor(result.ai_visibility.entity_density_score ?? 60)} />
                    <ScoreBar label="E-E-A-T" score={result.ai_visibility.eeat_score ?? 65} color={barColor(result.ai_visibility.eeat_score ?? 65)} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AI Visibility Details */}
          {result.ai_visibility && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('visibility')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white">AI Visibility Analysis</span>
                </div>
                {expanded === 'visibility' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expanded === 'visibility' && (
                <div className="px-5 pb-5 border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-emerald-400 mb-2">Strengths</div>
                    <ul className="space-y-1.5">
                      {result.ai_visibility.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-emerald-400 mt-0.5">+</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-400 mb-2">Weaknesses</div>
                    <ul className="space-y-1.5">
                      {result.ai_visibility.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-red-400 mt-0.5">−</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Gaps */}
          {result.content_gaps && result.content_gaps.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('gaps')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-white">Content Gaps ({result.content_gaps.length})</span>
                </div>
                {expanded === 'gaps' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expanded === 'gaps' && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
                  {result.content_gaps.map((gap, i) => (
                    <div key={i} className="py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{gap.topic}</span>
                        <span className={`text-xs font-bold ${gap.importance >= 8 ? 'text-red-400' : gap.importance >= 6 ? 'text-amber-400' : 'text-white/40'}`}>
                          Priority {gap.importance}/10
                        </span>
                      </div>
                      <div className="text-xs text-white/50">{gap.suggested_content}</div>
                      <div className="text-xs text-white/30 mt-0.5">Intent: {gap.search_intent}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weekly Content Plan */}
          {result.weekly_content_plan && result.weekly_content_plan.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('plan')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold text-white">4-Week Content Plan</span>
                </div>
                {expanded === 'plan' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expanded === 'plan' && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
                  {result.weekly_content_plan.map((week, i) => (
                    <div key={i} className="flex items-start gap-4 py-2 border-b border-white/5 last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                        W{week.week}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{week.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">{week.type}</span>
                          <span className="text-xs text-white/40">{week.estimated_impact}</span>
                        </div>
                        {week.target_keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {week.target_keywords.slice(0, 3).map((kw, j) => (
                              <span key={j} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Plan */}
          {result.action_plan && result.action_plan.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('actions')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-white">Action Plan ({result.action_plan.length} items)</span>
                </div>
                {expanded === 'actions' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expanded === 'actions' && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
                  {result.action_plan.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                        item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{item.priority}</span>
                      <div className="flex-1">
                        <div className="text-sm text-white">{item.action}</div>
                        <div className="text-xs text-white/40 mt-0.5">Impact: {item.impact} &bull; Timeline: {item.timeline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* What's Next? */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-1">What&apos;s Next?</h3>
            <p className="text-sm text-white/40 mb-4">Keep the momentum going — run another agent</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {WHATS_NEXT_GEO.map((agent) => (
                <Link
                  key={agent.name}
                  href={agent.href}
                  className={`group flex items-center gap-4 p-4 bg-white/5 border ${agent.border} rounded-xl hover:bg-white/10 transition-all cursor-pointer`}
                >
                  <Image src={agent.avatar} alt={agent.name} width={44} height={44} className="w-11 h-11 object-contain flex-shrink-0" style={{ filter: `drop-shadow(0 0 8px ${agent.glow})` }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{agent.name}</div>
                    <div className="text-xs text-white/40 mt-0.5 leading-snug">{agent.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-white/30 group-hover:text-white transition-colors" style={{ color: agent.color }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

