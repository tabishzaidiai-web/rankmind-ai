'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Search, AlertCircle, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Globe, FileText, Zap, Link2, BarChart3 } from 'lucide-react';

interface AuditResult {
  url: string;
  analyzed_at: string;
  overall_score: number;
  grade: string;
  keywords: Array<{ keyword: string; type: string; estimated_volume: number; difficulty: number; relevance: number }>;
  on_page: {
    title_tag: { score: number; present: boolean; length: number; includes_keyword: boolean; value: string; recommendation: string };
    meta_description: { score: number; present: boolean; length: number; includes_keyword: boolean; value: string; recommendation: string };
    headings: { score: number; h1_count: number; h2_count: number; h3_count: number; keyword_in_h1: boolean; recommendation: string };
    content_length: { score: number; word_count: number; recommended_min: number; recommendation: string };
    internal_links: { score: number; count: number; recommendation: string };
    images_alt: { score: number; total: number; missing_alt: number; recommendation: string };
  };
  technical: {
    load_time_ms: number;
    load_time_score: number;
    https: boolean;
    mobile_friendly: boolean;
    canonical_tag: boolean;
    robots_txt: boolean;
    sitemap: boolean;
    structured_data: boolean;
  };
  content_quality: { score: number; readability_score: number; fact_density: number; recommendation: string };
  geo_readiness: { score: number; has_faq: boolean; has_statistics: boolean; has_expert_quotes: boolean; recommendation: string };
  action_plan: Array<{ priority: string; action: string; impact: string; effort: string }>;
  llm_recommendations: string[];
}

interface AuditHistoryItem {
  id: string;
  url: string;
  score: number;
  grade: string;
  created_at: string;
}

function ScoreCircle({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-white">{score}</div>
      </div>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      <span className={ok ? 'text-white/70' : 'text-white/50'}>{label}</span>
    </div>
  );
}

function ScoreTrendChart({ history }: { history: AuditHistoryItem[] }) {
  if (history.length < 2) return null;
  const maxScore = 100;
  const w = 400;
  const h = 90;
  const padX = 24;
  const padY = 16;
  const pts = history.slice(-8).map((item, i, arr) => {
    const x = padX + (i / (arr.length - 1)) * (w - padX * 2);
    const y = h - padY - ((item.score / maxScore) * (h - padY * 2));
    return { x, y, score: item.score, date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${(h - padY).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(h - padY).toFixed(1)} Z`;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Score Trend</h3>
        <span className="text-xs text-white/40 ml-auto">Last {pts.length} audits</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: '200px', maxWidth: '100%' }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGrad)" />
          <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#7c3aed" stroke="#0a0a0f" strokeWidth="1.5" />
              <text x={p.x} y={h - 1} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">{p.date}</text>
              <text x={p.x} y={p.y - 9} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{p.score}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function SEOAuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('on_page');
  const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('audits')
          .select('id, url, score, grade, created_at')
          .order('created_at', { ascending: true })
          .limit(20);
        if (data) setAuditHistory(data);
      } catch {
        // silently fail — table may not exist yet
      }
    };
    fetchHistory();
  }, [result]); // re-fetch after each new audit

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  const gradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-emerald-400';
    if (grade === 'B+' || grade === 'B') return 'text-cyan-400';
    if (grade === 'C+' || grade === 'C') return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full space-y-6">
      <style>{`@keyframes floatAgent{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      {/* Radial glow */}
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-20" style={{background:'radial-gradient(circle,#7c3aed 0%,transparent 70%)',zIndex:0}} />

      {/* Top section: form (left) + avatar (right) */}
      <div className="flex items-start gap-8 relative z-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white mb-1">SEO Audit Agent</h1>
          <p className="text-white/50 text-sm mb-5">Real-time website analysis powered by RankBot AI</p>

          <form onSubmit={handleAudit} className="bg-white/5 border border-violet-500/20 rounded-2xl p-5">
            <label className="block text-sm font-medium text-white/70 mb-2">Website URL to Audit</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2 px-7 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Run Audit'}
              </button>
            </div>
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                AI is crawling your website, analyzing SEO factors, and generating recommendations...
              </div>
            )}
          </form>

          {error && (
            <div className="flex items-center gap-3 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="mt-5 border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-violet-400/60" />
              </div>
              <p className="text-white/40 text-sm font-medium">Your audit results will appear here</p>
              <p className="text-white/25 text-xs max-w-xs">Enter your website URL above and click Run Audit to get a full SEO analysis with scores, keyword data, and an action plan.</p>
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-col items-center justify-start pt-2 flex-shrink-0 w-52">
          <div style={{animation:'floatAgent 3s ease-in-out infinite',filter:'drop-shadow(0 0 30px rgba(124,58,237,0.5))'}}>
            <Image src="/agent-rankbot-transparent.png" alt="RankBot" width={200} height={200} className="w-44 h-44 object-contain" />
          </div>
          <span className="text-sm font-semibold text-violet-300 mt-2">RankBot</span>
          <span className="text-xs text-white/40">SEO Audit Agent</span>
        </div>
      </div>

      {/* Score Trend Chart */}
      {auditHistory.length >= 2 && (
        <div className="relative z-10">
          <ScoreTrendChart history={auditHistory} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 relative z-10">
          {/* Score Overview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <ScoreCircle score={result.overall_score} size={100} />
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`text-5xl font-black ${gradeColor(result.grade)}`}>{result.grade}</span>
                  <span className="text-white/50 text-sm">Overall SEO Score</span>
                </div>
                <div className="text-white/40 text-xs">{result.url} &bull; Analyzed {new Date(result.analyzed_at).toLocaleString()}</div>
                <div className="mt-3 flex gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{result.keywords?.length || 0}</div>
                    <div className="text-xs text-white/40">Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{result.action_plan?.length || 0}</div>
                    <div className="text-xs text-white/40">Action Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{result.technical?.https ? 'Yes' : 'No'}</div>
                    <div className="text-xs text-white/40">HTTPS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* On-Page SEO */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => toggle('on_page')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-violet-400" />
                <span className="font-semibold text-white">On-Page SEO</span>
              </div>
              {expandedSection === 'on_page' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>
            {expandedSection === 'on_page' && result.on_page && (
              <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
                {[
                  { label: 'Title Tag', data: result.on_page.title_tag },
                  { label: 'Meta Description', data: result.on_page.meta_description },
                  { label: 'Headings', data: result.on_page.headings },
                  { label: 'Content Length', data: result.on_page.content_length },
                  { label: 'Internal Links', data: result.on_page.internal_links },
                  { label: 'Image Alt Tags', data: result.on_page.images_alt },
                ].map(({ label, data }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{(data as { recommendation?: string }).recommendation}</div>
                    </div>
                    <div className={`text-sm font-bold flex-shrink-0 ${(data as { score: number }).score >= 80 ? 'text-emerald-400' : (data as { score: number }).score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {(data as { score: number }).score}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical SEO */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => toggle('technical')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">Technical SEO</span>
              </div>
              {expandedSection === 'technical' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>
            {expandedSection === 'technical' && result.technical && (
              <div className="px-5 pb-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <CheckItem ok={result.technical.https} label="HTTPS Enabled" />
                <CheckItem ok={result.technical.mobile_friendly} label="Mobile Friendly" />
                <CheckItem ok={result.technical.robots_txt} label="Robots.txt Present" />
                <CheckItem ok={result.technical.sitemap} label="XML Sitemap" />
                <CheckItem ok={result.technical.canonical_tag} label="Canonical Tag" />
                <CheckItem ok={result.technical.structured_data} label="Structured Data" />
                <div className="col-span-2 mt-2 text-sm text-white/50">
                  Load Time: <span className={result.technical.load_time_ms < 2000 ? 'text-emerald-400' : 'text-amber-400'}>{result.technical.load_time_ms}ms</span>
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          {result.keywords && result.keywords.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('keywords')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-white">Keywords ({result.keywords.length})</span>
                </div>
                {expandedSection === 'keywords' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expandedSection === 'keywords' && (
                <div className="border-t border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-white/40 font-medium">Keyword</th>
                        <th className="text-left px-5 py-3 text-white/40 font-medium">Type</th>
                        <th className="text-right px-5 py-3 text-white/40 font-medium">Volume</th>
                        <th className="text-right px-5 py-3 text-white/40 font-medium">Difficulty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.keywords.slice(0, 10).map((kw, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="px-5 py-3 text-white font-medium">{kw.keyword}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">{kw.type}</span>
                          </td>
                          <td className="px-5 py-3 text-right text-white/70">{kw.estimated_volume?.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={kw.difficulty < 40 ? 'text-emerald-400' : kw.difficulty < 70 ? 'text-amber-400' : 'text-red-400'}>
                              {kw.difficulty}/100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Action Plan */}
          {result.action_plan && result.action_plan.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => toggle('actions')} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white">Action Plan ({result.action_plan.length} items)</span>
                </div>
                {expandedSection === 'actions' ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expandedSection === 'actions' && (
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
                        <div className="text-xs text-white/40 mt-0.5">Impact: {item.impact} &bull; Effort: {item.effort}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LLM Recommendations */}
          {result.llm_recommendations && result.llm_recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-white text-sm">AI Recommendations</span>
              </div>
              <ul className="space-y-2">
                {result.llm_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-violet-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
