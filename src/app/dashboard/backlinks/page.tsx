'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, AlertCircle, Loader2, Globe, ExternalLink, Mail, CheckCircle2, Star, Link2, Copy, Check, X, ArrowRight } from 'lucide-react';

function ProgressStep({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-white/60 animate-in fade-in slide-in-from-left-2 duration-300">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 flex-shrink-0" />
      {label}
    </div>
  );
}

interface BacklinkOpportunity {
  id?: string;
  domain: string;
  url: string;
  title: string;
  type: string;
  estimated_da: number;
  niche_relevance: number;
  contact_email?: string;
  has_write_for_us: boolean;
  status: string;
  outreach_email?: { subject: string; body: string };
  notes?: string;
}

interface BacklinkCampaign {
  campaign_id: string;
  client_url: string;
  client_niche: string;
  target_keywords: string[];
  opportunities: BacklinkOpportunity[];
  articles_written: number;
  outreach_sent: number;
  links_secured: number;
  status: string;
  next_steps: string[];
}

// What's Next cards after backlinks completes
const WHATS_NEXT = [
  {
    href: '/dashboard/geo-score',
    avatar: '/agent-geog-transparent.png',
    name: 'GEO-G',
    title: 'GEO Optimizer',
    desc: 'Optimise for AI search: ChatGPT, Perplexity, Google AI Overviews',
    glow: 'rgba(59,130,246,0.35)',
    color: '#2563eb',
    border: 'border-blue-500/30',
  },
  {
    href: '/dashboard/content',
    avatar: '/agent-contentai-transparent.png',
    name: 'ContentAI',
    title: 'Content Writer',
    desc: 'Write a guest post article to submit to your new backlink prospects',
    glow: 'rgba(245,158,11,0.35)',
    color: '#d97706',
    border: 'border-amber-500/30',
  },
];

export default function BacklinksPage() {
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklinkCampaign | null>(null);
  const [error, setError] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<BacklinkOpportunity | null>(null);
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const isConfigError = error.includes('not configured') || error.includes('SERPER_API_KEY');

  // Pre-fill URL and niche from saved website
  useEffect(() => {
    const prefill = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: website } = await supabase
          .from('websites')
          .select('url, niche')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        if (website?.url) setUrl(website.url);
        if (website?.niche) setNiche(website.niche);
      } catch { /* no website saved yet */ }
    };
    prefill();
  }, []);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedOpp(null);
    setContacted(new Set());
    try {
      const res = await fetch('/api/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, niche, targetCount: 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run backlink campaign');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!selectedOpp?.outreach_email) return;
    navigator.clipboard.writeText(`Subject: ${selectedOpp.outreach_email.subject}\n\n${selectedOpp.outreach_email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkContacted = (domain: string) => {
    setContacted(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain); else next.add(domain);
      return next;
    });
  };

  const daColor = (da: number) => da >= 60 ? 'text-emerald-400' : da >= 40 ? 'text-amber-400' : 'text-white/60';
  const relevanceColor = (r: number) => r >= 8 ? 'text-emerald-400' : r >= 6 ? 'text-amber-400' : 'text-white/60';

  return (
    <div className="w-full space-y-6">
      <style>{`@keyframes floatAgent{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-20" style={{background:'radial-gradient(circle,#0d9488 0%,transparent 70%)',zIndex:0}} />

      {/* ── Top section: form (left) + avatar (right) ── */}
      <div className="flex items-start gap-8 relative z-10">

        {/* LEFT: title + form */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white mb-1">Backlink Builder Agent</h1>
          <p className="text-white/50 text-sm mb-5">Find real DA 40+ backlink opportunities and generate personalised outreach emails</p>

          <form onSubmit={handleRun} className="bg-white/5 border border-teal-500/20 rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Your Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Your Business Niche <span className="text-teal-400">*</span></label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder='e.g. "digital marketing", "e-commerce fashion", "SaaS tools"'
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors text-sm"
                />
                <p className="text-xs text-white/30 mt-1">Be specific — this determines the quality of prospects found</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Finding Opportunities...' : 'Find Backlink Opportunities'}
            </button>
            {loading && (
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Running 6 Google search queries for your niche', delay: 0 },
                  { label: 'Filtering & deduplicating prospects', delay: 800 },
                  { label: 'Scoring domain authority & relevance', delay: 1800 },
                  { label: 'Writing personalised outreach emails', delay: 3000 },
                ].map((step, i) => (
                  <ProgressStep key={i} label={step.label} delay={step.delay} />
                ))}
              </div>
            )}
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium mb-1">Could not find backlink prospects</p>
                  <p className="text-red-300/80">{error}</p>
                  {isConfigError && (
                    <p className="text-white/40 text-xs mt-2">
                      Tip: Add <code className="text-teal-400">SERPER_API_KEY</code> to your Vercel environment variables. Get a free key at{' '}
                      <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">serper.dev</a>
                    </p>
                  )}
                  {!isConfigError && (
                    <p className="text-white/40 text-xs mt-2">Tip: Try a broader niche keyword (e.g. &quot;digital marketing&quot; instead of a very specific phrase)</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="mt-5 border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                <Link2 className="w-7 h-7 text-teal-400/60" />
              </div>
              <p className="text-white/40 text-sm font-medium">Your backlink opportunities will appear here</p>
              <p className="text-white/25 text-xs max-w-xs">Enter your website URL above and click Find Backlink Opportunities to discover DA 40+ sites and get ready-to-send outreach emails.</p>
            </div>
          )}
        </div>

        {/* RIGHT: floating LinkBot avatar */}
        <div className="hidden md:flex flex-col items-center justify-start pt-2 flex-shrink-0 w-52">
          <div style={{animation:'floatAgent 3s ease-in-out infinite',filter:'drop-shadow(0 0 30px rgba(13,148,136,0.5))'}}>
            <Image src="/agent-linkbot-transparent.png" alt="LinkBot" width={200} height={200} className="w-44 h-44 object-contain" />
          </div>
          <span className="text-sm font-semibold text-teal-300 mt-2">LinkBot</span>
          <span className="text-xs text-white/40">Backlink Builder</span>
        </div>
      </div>

      {/* ── Results (full width) ── */}
      {result && (
        <div className="space-y-4 relative z-10">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Opportunities Found', value: result.opportunities?.length || 0, color: 'text-teal-400' },
              { label: 'Outreach Emails', value: result.outreach_sent || 0, color: 'text-emerald-400' },
              { label: 'Contacted', value: contacted.size, color: 'text-violet-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Opportunities Table */}
          {result.opportunities && result.opportunities.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h2 className="font-semibold text-white">Backlink Opportunities</h2>
                <p className="text-sm text-white/40 mt-0.5">Click any row to view and edit the outreach email draft</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/40 font-medium">Domain</th>
                      <th className="text-left px-5 py-3 text-white/40 font-medium">Type</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">DA</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Relevance</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.opportunities.map((opp, i) => {
                      const isSelected = selectedOpp?.domain === opp.domain;
                      const isContacted = contacted.has(opp.domain);
                      return (
                        <tr
                          key={i}
                          onClick={() => setSelectedOpp(isSelected ? null : opp)}
                          className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                            isContacted ? 'opacity-40' :
                            isSelected ? 'bg-teal-500/10 border-l-2 border-l-teal-500' :
                            'hover:bg-white/5'
                          }`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{opp.domain}</span>
                              <a href={opp.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                <ExternalLink className="w-3 h-3 text-white/30 hover:text-teal-400 transition-colors" />
                              </a>
                              {isContacted && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-1">Contacted</span>}
                            </div>
                            <div className="text-xs text-white/40 truncate max-w-[220px] mt-0.5">{opp.title}</div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full capitalize">{opp.type?.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`font-bold ${daColor(opp.estimated_da)}`}>{opp.estimated_da}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 text-amber-400" />
                              <span className={relevanceColor(opp.niche_relevance)}>{opp.niche_relevance}/10</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            {opp.outreach_email ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <span className="text-white/20 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Slide-in Email Panel ── */}
          {selectedOpp && (
            <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-2xl p-5 animate-in slide-in-from-bottom-4 duration-200">
              {/* Panel header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{selectedOpp.domain}</div>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                      <a href={selectedOpp.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-teal-400 transition-colors">
                        {selectedOpp.url.slice(0, 50)}{selectedOpp.url.length > 50 ? '…' : ''}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedOpp(null)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                <span className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg">DA <span className={`font-bold ${daColor(selectedOpp.estimated_da)}`}>{selectedOpp.estimated_da}</span></span>
                <span className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg">Relevance <span className={`font-bold ${relevanceColor(selectedOpp.niche_relevance)}`}>{selectedOpp.niche_relevance}/10</span></span>
                <span className="bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-lg capitalize">{selectedOpp.type?.replace(/_/g, ' ')}</span>
                {selectedOpp.has_write_for_us && <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">Write For Us page found</span>}
              </div>

              {/* Notes */}
              {selectedOpp.notes && (
                <p className="text-xs text-white/50 mb-4 bg-white/5 rounded-lg px-3 py-2">{selectedOpp.notes}</p>
              )}

              {/* Email draft */}
              {selectedOpp.outreach_email ? (
                <>
                  <div className="bg-black/30 rounded-xl p-4 space-y-3 mb-4">
                    <div>
                      <span className="text-xs text-white/40 uppercase tracking-wider">Subject</span>
                      <div className="text-sm text-white font-medium mt-1">{selectedOpp.outreach_email.subject}</div>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <span className="text-xs text-white/40 uppercase tracking-wider">Body</span>
                      <textarea
                        defaultValue={selectedOpp.outreach_email.body}
                        rows={8}
                        className="w-full mt-1 bg-transparent text-sm text-white/80 leading-relaxed resize-none focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-xl transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Email'}
                    </button>
                    <button
                      onClick={() => handleMarkContacted(selectedOpp.domain)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                        contacted.has(selectedOpp.domain)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 hover:bg-white/15 text-white/70'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {contacted.has(selectedOpp.domain) ? 'Marked as Contacted' : 'Mark as Contacted'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40 italic">No outreach email was generated for this site.</p>
              )}
            </div>
          )}

          {/* Next Steps (agent) */}
          {result.next_steps && result.next_steps.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Next Steps</h3>
              <ul className="space-y-2">
                {result.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-teal-400 mt-0.5">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── What's Next? ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-1">What&apos;s Next?</h3>
            <p className="text-sm text-white/40 mb-4">Keep the momentum going — run another agent</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {WHATS_NEXT.map((agent) => (
                <Link
                  key={agent.name}
                  href={agent.href}
                  className={`group flex items-center gap-4 p-4 bg-white/5 border ${agent.border} rounded-xl hover:bg-white/10 transition-all cursor-pointer`}
                  style={{ boxShadow: `0 0 0 0 ${agent.glow}` }}
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
