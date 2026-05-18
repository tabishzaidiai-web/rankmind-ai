'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, TrendingUp, BarChart3, Target, Loader2, AlertCircle, Plus, ArrowRight, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Keyword {
  id?: string;
  keyword: string;
  type: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  search_intent: string;
  ranking_position?: number | null;
  target_country?: string;
}

function DifficultyBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-green-400 bg-green-500/10 border-green-500/20';
  const label = score >= 70 ? 'Hard' : score >= 40 ? 'Medium' : 'Easy';
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${color}`}>{label} {score}</span>;
}

function IntentBadge({ intent }: { intent: string }) {
  const map: Record<string, string> = {
    informational: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    commercial: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    transactional: 'text-green-400 bg-green-500/10 border-green-500/20',
    navigational: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[intent] || 'text-white/40 bg-white/5 border-white/10'}`}>{intent}</span>;
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    primary: 'text-violet-300 bg-violet-500/15 border-violet-500/25',
    secondary: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/25',
    supporting: 'text-green-300 bg-green-500/15 border-green-500/25',
    longtail: 'text-amber-300 bg-amber-500/15 border-amber-500/25',
    trust: 'text-rose-300 bg-rose-500/15 border-rose-500/25',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[type] || 'text-white/40 bg-white/5 border-white/10'}`}>{type}</span>;
}

function ProgressStep({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-white/60 animate-in fade-in slide-in-from-left-2 duration-300">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-green-400 flex-shrink-0" />
      {label}
    </div>
  );
}

export default function KeywordsPage() {
  const [website, setWebsite] = useState<{ id: string; domain: string; niche?: string; target_countries?: string[]; language?: string } | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seeds, setSeeds] = useState(['', '', '']);
  const [filterType, setFilterType] = useState('all');
  const [filterIntent, setFilterIntent] = useState('all');
  const [sortBy, setSortBy] = useState<'search_volume' | 'difficulty' | 'cpc'>('search_volume');
  const [addingToContent, setAddingToContent] = useState<string | null>(null);

  const loadWebsiteAndKeywords = useCallback(async () => {
    const supabase = createClient();
    const { data: ws } = await supabase
      .from('websites')
      .select('id, domain, niche, target_countries, language')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (ws) {
      setWebsite(ws);
      const { data: kws } = await supabase
        .from('keywords')
        .select('*')
        .eq('website_id', ws.id)
        .order('search_volume', { ascending: false });
      if (kws) setKeywords(kws);
    }
  }, []);

  useEffect(() => { loadWebsiteAndKeywords(); }, [loadWebsiteAndKeywords]);

  const handleResearch = async () => {
    const validSeeds = seeds.filter(s => s.trim());
    if (validSeeds.length === 0) { setError('Enter at least one seed keyword'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: website?.id,
          seeds: validSeeds,
          targetCountry: website?.target_countries?.[0] || 'United States',
          language: website?.language || 'English',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Research failed');
      setKeywords(data.keywords || []);
      await loadWebsiteAndKeywords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const addToContentQueue = async (kw: Keyword) => {
    setAddingToContent(kw.keyword);
    try {
      const supabase = createClient();
      await supabase.from('content_queue').insert({
        website_id: website?.id,
        title: `[Draft] Article about: ${kw.keyword}`,
        target_keyword: kw.keyword,
        status: 'draft',
      });
    } finally {
      setAddingToContent(null);
    }
  };

  const filtered = keywords
    .filter(k => filterType === 'all' || k.type === filterType)
    .filter(k => filterIntent === 'all' || k.search_intent === filterIntent)
    .sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

  const typeGroups = ['primary', 'secondary', 'supporting', 'longtail', 'trust'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 relative flex-shrink-0">
          <Image src="/agent-rankbot-transparent.png" alt="RankBot" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Keyword Research</h1>
          <p className="text-white/50 text-sm">Discover, organise, and track keywords for your content strategy</p>
        </div>
      </div>

      {/* Research form */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Research Keywords</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {seeds.map((s, i) => (
            <input
              key={i}
              type="text"
              value={s}
              onChange={e => { const u = [...seeds]; u[i] = e.target.value; setSeeds(u); }}
              placeholder={['Primary keyword', 'Secondary keyword', 'Third keyword'][i]}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 text-sm"
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Researching...' : 'Research Keywords'}
          </button>
          {website?.niche && (
            <span className="text-xs text-white/30">Targeting: {website.niche} · {website.target_countries?.[0] || 'US'}</span>
          )}
        </div>
        {loading && (
          <div className="mt-4 space-y-2">
            {[
              { label: 'Pulling seed keyword data from DataForSEO', delay: 0 },
              { label: 'Expanding keyword universe (50+ variations)', delay: 800 },
              { label: 'Scoring difficulty and search intent', delay: 1800 },
              { label: 'Organising into 5 keyword groups', delay: 2800 },
            ].map((step, i) => <ProgressStep key={i} label={step.label} delay={step.delay} />)}
          </div>
        )}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}
      </div>

      {/* Summary cards */}
      {keywords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {typeGroups.map(type => {
            const count = keywords.filter(k => k.type === type).length;
            const avgVol = count > 0 ? Math.round(keywords.filter(k => k.type === type).reduce((s, k) => s + k.search_volume, 0) / count) : 0;
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
                className={`p-4 rounded-xl border text-left transition-all ${filterType === type ? 'bg-violet-500/15 border-violet-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
              >
                <TypeBadge type={type} />
                <div className="text-2xl font-bold text-white mt-2">{count}</div>
                <div className="text-xs text-white/30">avg {avgVol.toLocaleString()} vol</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Keywords table */}
      {keywords.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {/* Table controls */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Filter className="w-3.5 h-3.5" />
              <span>{filtered.length} keywords</span>
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              <select value={filterIntent} onChange={e => setFilterIntent(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs focus:outline-none">
                <option value="all">All intents</option>
                <option value="informational">Informational</option>
                <option value="commercial">Commercial</option>
                <option value="transactional">Transactional</option>
                <option value="navigational">Navigational</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'search_volume' | 'difficulty' | 'cpc')} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs focus:outline-none">
                <option value="search_volume">Sort: Volume</option>
                <option value="difficulty">Sort: Difficulty</option>
                <option value="cpc">Sort: CPC</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs border-b border-white/10">
                  <th className="text-left px-4 py-3 font-medium">Keyword</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Volume</th>
                  <th className="text-left px-4 py-3 font-medium">Difficulty</th>
                  <th className="text-right px-4 py-3 font-medium">CPC</th>
                  <th className="text-left px-4 py-3 font-medium">Intent</th>
                  <th className="text-right px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kw, i) => (
                  <tr key={kw.id || i} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{kw.keyword}</td>
                    <td className="px-4 py-3"><TypeBadge type={kw.type} /></td>
                    <td className="px-4 py-3 text-right text-white/70">{kw.search_volume.toLocaleString()}</td>
                    <td className="px-4 py-3"><DifficultyBadge score={kw.difficulty} /></td>
                    <td className="px-4 py-3 text-right text-white/70">${kw.cpc?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3"><IntentBadge intent={kw.search_intent} /></td>
                    <td className="px-4 py-3 text-right">
                      {kw.ranking_position
                        ? <span className={`font-semibold ${kw.ranking_position <= 3 ? 'text-green-400' : kw.ranking_position <= 10 ? 'text-amber-400' : 'text-white/40'}`}>#{kw.ranking_position}</span>
                        : <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => addToContentQueue(kw)}
                        disabled={addingToContent === kw.keyword}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs transition-all disabled:opacity-50"
                      >
                        {addingToContent === kw.keyword ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add to Content
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {keywords.length === 0 && !loading && (
        <div className="border border-dashed border-white/15 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-green-400/60" />
          </div>
          <p className="text-white/40 text-sm font-medium">No keywords yet</p>
          <p className="text-white/25 text-xs max-w-xs">Enter your seed keywords above and click Research to discover your full keyword universe with search volumes, difficulty scores, and search intent.</p>
          {!website && (
            <Link href="/dashboard/onboarding" className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 mt-2">
              Complete onboarding first <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* What's Next */}
      {keywords.length > 0 && (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <span className="text-white/70 text-sm font-medium">What&apos;s Next?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/dashboard/content', src: '/agent-contentai-transparent.png', name: 'ContentAI', title: 'Write Content', desc: 'Generate SEO articles targeting your top keywords', color: 'hover:border-amber-500/30' },
              { href: '/dashboard/seo-audit', src: '/agent-rankbot-transparent.png', name: 'RankBot', title: 'Run SEO Audit', desc: 'Check how well your site is optimised for these keywords', color: 'hover:border-violet-500/30' },
            ].map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl ${item.color} transition-all group`}>
                <div className="w-10 h-10 relative flex-shrink-0">
                  <Image src={item.src} alt={item.name} fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  <div className="text-white/40 text-xs">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
