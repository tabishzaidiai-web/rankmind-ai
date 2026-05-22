'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Search, TrendingUp, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Zap, BarChart3, Globe, FileText, Star, ArrowRight, RefreshCw } from 'lucide-react';

interface CitationAnalysis {
  url: string;
  analyzed_at: string;
  overall_citation_score: number;
  grade: string;
  platforms: {
    google_ai_overviews: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    google_ai_mode: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    chatgpt_search: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
    perplexity: { score: number; likelihood: string; reasons: string[]; improvements: string[] };
  };
  content_signals: {
    semantic_completeness_score: number;
    optimal_passage_length: boolean;
    faq_sections_present: boolean;
    statistics_density: number;
    entity_density: number;
    declarative_answer_openers: boolean;
    front_loaded_key_claims: boolean;
  };
  eeat_signals: {
    score: number;
    author_byline_present: boolean;
    expert_citations: boolean;
    original_data_present: boolean;
    brand_entity_recognized: boolean;
    external_mentions: number;
    improvements: string[];
  };
  schema_signals: {
    score: number;
    types_detected: string[];
    missing_high_impact: string[];
    faq_schema_present: boolean;
    article_schema_present: boolean;
  };
  freshness_signals: {
    score: number;
    last_updated_estimate: string;
    days_since_update: number;
    citation_decay_risk: 'low' | 'medium' | 'high';
    recommendation: string;
  };
  citation_gaps: Array<{
    topic: string;
    why_competitors_win: string;
    fix: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  action_plan: Array<{
    priority: number;
    action: string;
    why: string;
    expected_impact: string;
    effort: 'quick' | 'medium' | 'large';
    timeline: string;
  }>;
  share_of_voice: {
    estimated_citation_rate: number;
    industry_average: number;
    potential_if_optimized: number;
    traffic_opportunity: string;
  };
}

function ScoreCircle({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-bold text-white" style={{ fontSize: size * 0.22 }}>{score}</div>
      </div>
    </div>
  );
}

function PlatformCard({ name, logo, data }: { name: string; logo: string; data: { score: number; likelihood: string; reasons: string[]; improvements: string[] } }) {
  const [open, setOpen] = useState(false);
  const color = data.score >= 75 ? 'text-emerald-400' : data.score >= 50 ? 'text-amber-400' : 'text-red-400';
  const bg = data.score >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : data.score >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${color}`}>{data.likelihood}</span>
          <span className={`text-lg font-bold ${color}`}>{data.score}</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full mb-3">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${data.score}%`, background: data.score >= 75 ? '#10b981' : data.score >= 50 ? '#f59e0b' : '#ef4444' }} />
      </div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? 'Hide details' : 'Show details'}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {data.reasons.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-1.5 font-medium">Why this score:</p>
              {data.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-white/60 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}
          {data.improvements.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-1.5 font-medium">To improve:</p>
              {data.improvements.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-white/60 mb-1">
                  <ArrowRight className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AICitationPage() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CitationAnalysis | null>(null);
  const [history, setHistory] = useState<CitationAnalysis[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'signals' | 'gaps' | 'actions'>('overview');

  useEffect(() => {
    fetch('/api/ai-citation').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setHistory(d);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('/api/ai-citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keywords: kws }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setHistory(prev => [data, ...prev.slice(0, 9)]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'platforms', label: 'AI Platforms' },
    { id: 'signals', label: 'Content Signals' },
    { id: 'gaps', label: 'Citation Gaps' },
    { id: 'actions', label: 'Action Plan' },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 relative flex-shrink-0">
          <Image src="/agent-rankbot-transparent.png" alt="CitationBot" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Citation Tracker</h1>
          <p className="text-white/50 text-sm mt-0.5">See how likely your content is to be cited in Google AI Overviews, AI Mode, ChatGPT Search & Perplexity</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'AI Overviews coverage', value: '48%', sub: 'of all Google queries', color: 'text-violet-400' },
          { label: 'CTR drop without citation', value: '-61%', sub: 'vs being cited inside AI answer', color: 'text-red-400' },
          { label: 'AI visitor conversion rate', value: '14.2%', sub: 'vs 2.8% traditional organic', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/60 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Analyze Your AI Citation Readiness</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Website URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Target Keywords (comma separated, optional)</label>
            <input
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="best SEO tool, AI SEO software, rank in AI search"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing AI citation readiness...</> : <><Search className="w-4 h-4" /> Analyze AI Citation Score</>}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score Hero */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <ScoreCircle score={result.overall_citation_score} size={100} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">Citation Score: {result.overall_citation_score}/100</h2>
                  <span className={`text-lg font-bold px-3 py-1 rounded-lg ${result.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' : result.grade === 'B' ? 'bg-blue-500/20 text-blue-400' : result.grade === 'C' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    Grade {result.grade}
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-4">{result.url}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-violet-400 font-bold text-lg">{result.share_of_voice.estimated_citation_rate}%</div>
                    <div className="text-white/40 text-xs">Est. Citation Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-cyan-400 font-bold text-lg">{result.share_of_voice.industry_average}%</div>
                    <div className="text-white/40 text-xs">Industry Average</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-emerald-400 font-bold text-lg">{result.share_of_voice.potential_if_optimized}%</div>
                    <div className="text-white/40 text-xs">Potential if Optimized</div>
                  </div>
                </div>
              </div>
            </div>
            {result.share_of_voice.traffic_opportunity && (
              <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <p className="text-violet-300 text-sm"><Zap className="w-4 h-4 inline mr-1" />{result.share_of_voice.traffic_opportunity}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:text-white/70'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Content Signals Summary */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-violet-400" />Content Signals</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Semantic Completeness', value: `${result.content_signals.semantic_completeness_score}/100`, ok: result.content_signals.semantic_completeness_score >= 70 },
                    { label: 'Optimal Passage Length (134-167w)', value: result.content_signals.optimal_passage_length ? 'Yes' : 'No', ok: result.content_signals.optimal_passage_length },
                    { label: 'FAQ Sections Present', value: result.content_signals.faq_sections_present ? 'Yes' : 'No', ok: result.content_signals.faq_sections_present },
                    { label: 'Statistics Density', value: `${result.content_signals.statistics_density}/200w`, ok: result.content_signals.statistics_density >= 1 },
                    { label: 'Entity Density', value: `${result.content_signals.entity_density}/500w`, ok: result.content_signals.entity_density >= 5 },
                    { label: 'Declarative Answer Openers', value: result.content_signals.declarative_answer_openers ? 'Yes' : 'No', ok: result.content_signals.declarative_answer_openers },
                    { label: 'Front-Loaded Key Claims', value: result.content_signals.front_loaded_key_claims ? 'Yes' : 'No', ok: result.content_signals.front_loaded_key_claims },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">{item.label}</span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* E-E-A-T + Schema */}
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />E-E-A-T Score: {result.eeat_signals.score}/100</h3>
                  <div className="h-2 bg-white/10 rounded-full mb-3">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${result.eeat_signals.score}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Author Byline', ok: result.eeat_signals.author_byline_present },
                      { label: 'Expert Citations', ok: result.eeat_signals.expert_citations },
                      { label: 'Original Data', ok: result.eeat_signals.original_data_present },
                      { label: 'Brand Entity Recognized', ok: result.eeat_signals.brand_entity_recognized },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2 text-xs">
                        {item.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
                        <span className={item.ok ? 'text-white/70' : 'text-white/40'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" />Schema Markup: {result.schema_signals.score}/100</h3>
                  <div className="h-2 bg-white/10 rounded-full mb-3">
                    <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${result.schema_signals.score}%` }} />
                  </div>
                  {result.schema_signals.types_detected.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.schema_signals.types_detected.map(t => (
                        <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  {result.schema_signals.missing_high_impact.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Missing (high impact):</p>
                      <div className="flex flex-wrap gap-1">
                        {result.schema_signals.missing_high_impact.map(t => (
                          <span key={t} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Freshness */}
              <div className="col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-400" />Content Freshness</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${result.freshness_signals.citation_decay_risk === 'low' ? 'text-emerald-400' : result.freshness_signals.citation_decay_risk === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      {result.freshness_signals.score}/100
                    </div>
                    <div className="text-white/40 text-xs">Freshness Score</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${result.freshness_signals.citation_decay_risk === 'low' ? 'bg-emerald-500/20 text-emerald-400' : result.freshness_signals.citation_decay_risk === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {result.freshness_signals.citation_decay_risk.toUpperCase()} DECAY RISK
                      </span>
                      <span className="text-white/40 text-xs">~{result.freshness_signals.days_since_update} days since last update</span>
                    </div>
                    <p className="text-white/60 text-sm">{result.freshness_signals.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Platforms */}
          {activeTab === 'platforms' && (
            <div className="grid grid-cols-2 gap-4">
              <PlatformCard name="Google AI Overviews" logo="" data={result.platforms.google_ai_overviews} />
              <PlatformCard name="Google AI Mode" logo="" data={result.platforms.google_ai_mode} />
              <PlatformCard name="ChatGPT Search" logo="" data={result.platforms.chatgpt_search} />
              <PlatformCard name="Perplexity" logo="" data={result.platforms.perplexity} />
            </div>
          )}

          {/* Tab: Signals */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              {result.eeat_signals.improvements.length > 0 && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3">E-E-A-T Improvements</h3>
                  <div className="space-y-2">
                    {result.eeat_signals.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/70 p-3 bg-white/[0.02] rounded-xl">
                        <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                        {imp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Schema Markup Needed</h3>
                <div className="space-y-2">
                  {result.schema_signals.missing_high_impact.map((schema, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <span className="text-white/80 text-sm font-medium">{schema}</span>
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Missing</span>
                    </div>
                  ))}
                  {result.schema_signals.types_detected.map((schema, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="text-white/80 text-sm font-medium">{schema}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Detected</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Citation Gaps */}
          {activeTab === 'gaps' && (
            <div className="space-y-3">
              {result.citation_gaps.map((gap, i) => (
                <div key={i} className={`border rounded-2xl p-5 ${gap.impact === 'high' ? 'border-red-500/30 bg-red-500/5' : gap.impact === 'medium' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold">{gap.topic}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gap.impact === 'high' ? 'bg-red-500/20 text-red-400' : gap.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/50'}`}>
                      {gap.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-3"><strong className="text-white/70">Why competitors win:</strong> {gap.why_competitors_win}</p>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/40 mb-1">How to fix:</p>
                    <p className="text-white/70 text-sm">{gap.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Action Plan */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              {result.action_plan.sort((a, b) => a.priority - b.priority).map((action, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                      {action.priority}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-white font-semibold">{action.action}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${action.effort === 'quick' ? 'bg-emerald-500/20 text-emerald-400' : action.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                            {action.effort}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/50 text-sm mb-2">{action.why}</p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="text-emerald-400 font-medium">{action.expected_impact}</span>
                        <span>{action.timeline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {!result && history.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Analyses</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => setResult(h)} className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/5 border border-white/[0.05] rounded-xl transition-all text-left">
                <div>
                  <div className="text-white/80 text-sm font-medium">{h.url}</div>
                  <div className="text-white/30 text-xs">{new Date(h.analyzed_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${h.overall_citation_score >= 75 ? 'text-emerald-400' : h.overall_citation_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {h.overall_citation_score}/100
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${h.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' : h.grade === 'B' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {h.grade}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
