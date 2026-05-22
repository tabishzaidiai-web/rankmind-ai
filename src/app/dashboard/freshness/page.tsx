'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock, Zap, ArrowRight, Calendar, TrendingUp, FileText } from 'lucide-react';

interface FreshnessAnalysis {
  url: string;
  analyzed_at: string;
  overall_freshness_score: number;
  site_assessment: {
    estimated_last_major_update: string;
    content_age_risk: 'low' | 'medium' | 'high' | 'critical';
    pages_at_risk: number;
    ai_citation_decay_status: string;
  };
  pages_to_update: Array<{
    url: string;
    estimated_age_days: number;
    decay_risk: 'low' | 'medium' | 'high' | 'critical';
    current_ranking_potential: string;
    update_priority: number;
    specific_updates_needed: string[];
    new_sections_to_add: string[];
    outdated_stats_to_replace: string[];
    estimated_time_to_update: string;
    expected_citation_boost: string;
  }>;
  update_recommendations: Array<{
    category: string;
    recommendation: string;
    why_it_matters: string;
    example: string;
    effort: 'quick' | 'medium' | 'large';
  }>;
  new_content_opportunities: Array<{
    title: string;
    type: string;
    target_keywords: string[];
    why_now: string;
    estimated_impact: string;
    outline: string[];
  }>;
  refresh_plan: Array<{
    week: number;
    action: string;
    page: string;
    specific_task: string;
    time_estimate: string;
  }>;
}

function RiskBadge({ risk }: { risk: string }) {
  const styles = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }[risk] || 'bg-white/10 text-white/50 border-white/20';
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles}`}>{risk.toUpperCase()}</span>;
}

export default function FreshnessPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreshnessAnalysis | null>(null);
  const [history, setHistory] = useState<FreshnessAnalysis[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'recommendations' | 'opportunities' | 'plan'>('overview');

  useEffect(() => {
    fetch('/api/freshness').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setHistory(d);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/freshness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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
    { id: 'pages', label: 'Pages to Update' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'opportunities', label: 'New Content' },
    { id: 'plan', label: '90-Day Plan' },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 relative flex-shrink-0">
          <Image src="/agent-contentai-transparent.png" alt="FreshnessBot" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Content Freshness Monitor</h1>
          <p className="text-white/50 text-sm mt-0.5">Content under 90 days old is 3x more likely to be cited in AI answers. Never let your content go stale.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { stat: '3x', label: 'more AI citations for content under 90 days old', color: 'text-violet-400' },
          { stat: '90 days', label: 'content freshness decay threshold for AI citations', color: 'text-amber-400' },
          { stat: '5x', label: 'more efficient to update than rewrite from scratch', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.stat}</div>
            <div className="text-white/50 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Analyze Content Freshness</h2>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><RefreshCw className="w-4 h-4" />Analyze Freshness</>}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score Hero */}
          <div className={`border rounded-2xl p-6 ${result.site_assessment.content_age_risk === 'critical' ? 'bg-red-500/5 border-red-500/30' : result.site_assessment.content_age_risk === 'high' ? 'bg-orange-500/5 border-orange-500/30' : result.site_assessment.content_age_risk === 'medium' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${result.overall_freshness_score >= 70 ? 'text-emerald-400' : result.overall_freshness_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.overall_freshness_score}
                </div>
                <div className="text-white/40 text-xs mt-1">Freshness Score</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <RiskBadge risk={result.site_assessment.content_age_risk} />
                  <span className="text-white/40 text-sm">{result.site_assessment.pages_at_risk} pages at risk</span>
                </div>
                <p className="text-white/70 text-sm mb-2">{result.site_assessment.ai_citation_decay_status}</p>
                <p className="text-white/40 text-xs">Last major update: {result.site_assessment.estimated_last_major_update}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:text-white/70'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />Pages Needing Updates</h3>
                <div className="space-y-2">
                  {result.pages_to_update.slice(0, 4).map((page, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60 text-xs truncate flex-1 mr-2">{page.url.replace(/^https?:\/\//, '').slice(0, 40)}</span>
                      <RiskBadge risk={page.decay_risk} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />New Content Opportunities</h3>
                <div className="space-y-2">
                  {result.new_content_opportunities.slice(0, 4).map((opp, i) => (
                    <div key={i} className="p-2 bg-white/[0.02] rounded-lg">
                      <p className="text-white/70 text-xs font-medium">{opp.title}</p>
                      <p className="text-white/30 text-xs">{opp.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Pages to Update */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              {result.pages_to_update.map((page, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">Priority #{page.update_priority}</span>
                        <RiskBadge risk={page.decay_risk} />
                      </div>
                      <p className="text-white/50 text-xs">{page.url}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-sm">~{page.estimated_age_days}d old</div>
                      <div className="text-white/30 text-xs">{page.estimated_time_to_update}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-3">
                    <p className="text-emerald-300 text-xs"><Zap className="w-3 h-3 inline mr-1" />{page.expected_citation_boost}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {page.specific_updates_needed.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 mb-1.5 font-medium">Specific updates needed:</p>
                        {page.specific_updates_needed.map((u, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-xs text-white/60 mb-1">
                            <ArrowRight className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />{u}
                          </div>
                        ))}
                      </div>
                    )}
                    {page.new_sections_to_add.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 mb-1.5 font-medium">New sections to add:</p>
                        {page.new_sections_to_add.map((s, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-xs text-white/60 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />{s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Recommendations */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3">
              {result.update_recommendations.map((rec, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-violet-400 font-medium">{rec.category}</span>
                      <h3 className="text-white font-semibold mt-0.5">{rec.recommendation}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${rec.effort === 'quick' ? 'bg-emerald-500/20 text-emerald-400' : rec.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {rec.effort}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{rec.why_it_matters}</p>
                  {rec.example && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-xs text-white/30 mb-1">Example:</p>
                      <p className="text-white/60 text-sm italic">{rec.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab: New Content Opportunities */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {result.new_content_opportunities.map((opp, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-cyan-400 font-medium">{opp.type}</span>
                      <h3 className="text-white font-semibold mt-0.5">{opp.title}</h3>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{opp.estimated_impact}</span>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{opp.why_now}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {opp.target_keywords.map((kw, j) => (
                      <span key={j} className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">{kw}</span>
                    ))}
                  </div>
                  {opp.outline.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 mb-1.5">Suggested outline:</p>
                      <div className="space-y-1">
                        {opp.outline.map((item, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-xs text-white/50">
                            <span className="text-white/20">{j + 1}.</span>{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab: 90-Day Plan */}
          {activeTab === 'plan' && (
            <div className="space-y-3">
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-2">
                <p className="text-violet-300 text-sm"><Calendar className="w-4 h-4 inline mr-2" />Your 90-day content refresh plan to maintain AI citation eligibility across all pages.</p>
              </div>
              {result.refresh_plan.map((item, i) => (
                <div key={i} className="flex gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-violet-400 text-xs font-medium">Wk</span>
                    <span className="text-violet-300 font-bold text-sm">{item.week}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium text-sm">{item.action}</h3>
                      <span className="text-white/30 text-xs">{item.time_estimate}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-1">{item.page}</p>
                    <p className="text-white/60 text-sm">{item.specific_task}</p>
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
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${h.overall_freshness_score >= 70 ? 'text-emerald-400' : h.overall_freshness_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                    {h.overall_freshness_score}/100
                  </span>
                  <RiskBadge risk={h.site_assessment?.content_age_risk || 'medium'} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
