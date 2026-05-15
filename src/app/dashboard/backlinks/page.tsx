'use client';
import { useState } from 'react';
import { Link2, Search, AlertCircle, Loader2, Globe, ExternalLink, Mail, CheckCircle2, Star } from 'lucide-react';

interface BacklinkOpportunity {
  domain: string;
  url: string;
  title: string;
  type: string;
  estimated_da: number;
  niche_relevance: number;
  contact_email?: string;
  has_write_for_us: boolean;
  status: string;
  outreach_email?: {
    subject: string;
    body: string;
  };
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

export default function BacklinksPage() {
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacklinkCampaign | null>(null);
  const [error, setError] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<BacklinkOpportunity | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
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

  const daColor = (da: number) => da >= 60 ? 'text-emerald-400' : da >= 40 ? 'text-amber-400' : 'text-white/60';
  const relevanceColor = (r: number) => r >= 8 ? 'text-emerald-400' : r >= 6 ? 'text-amber-400' : 'text-white/60';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Backlink Builder Agent</h1>
          <p className="text-white/50 text-sm">Find real backlink opportunities and generate outreach emails</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleRun} className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Your Website URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Your Niche (optional)</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. SaaS, e-commerce, health..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Finding Opportunities...' : 'Find Backlink Opportunities'}
        </button>
        {loading && (
          <div className="mt-3 text-sm text-white/40">
            AI is analyzing your site, searching for opportunities, and drafting outreach emails...
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Opportunities Found', value: result.opportunities?.length || 0, color: 'text-cyan-400' },
              { label: 'Articles Written', value: result.articles_written || 0, color: 'text-violet-400' },
              { label: 'Outreach Emails', value: result.outreach_sent || 0, color: 'text-emerald-400' },
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
                <p className="text-sm text-white/40 mt-0.5">Click any row to view the outreach email draft</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/40 font-medium">Domain</th>
                      <th className="text-left px-5 py-3 text-white/40 font-medium">Type</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">DA</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Relevance</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Contact</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.opportunities.map((opp, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedOpp(selectedOpp?.domain === opp.domain ? null : opp)}
                        className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${selectedOpp?.domain === opp.domain ? 'bg-cyan-500/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-white">{opp.domain}</div>
                            <a href={opp.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink className="w-3 h-3 text-white/30 hover:text-white" />
                            </a>
                          </div>
                          <div className="text-xs text-white/40 truncate max-w-[200px]">{opp.title}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{opp.type}</span>
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
                          {opp.contact_email ? (
                            <span className="text-xs text-white/60">{opp.contact_email}</span>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {opp.outreach_email ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outreach Email Preview */}
          {selectedOpp?.outreach_email && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Outreach Email — {selectedOpp.domain}</span>
              </div>
              <div className="bg-black/20 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-xs text-white/40">Subject: </span>
                  <span className="text-sm text-white font-medium">{selectedOpp.outreach_email.subject}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedOpp.outreach_email.body}
                  </pre>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${selectedOpp.outreach_email!.subject}\n\n${selectedOpp.outreach_email!.body}`);
                }}
                className="mt-3 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          )}

          {/* Next Steps */}
          {result.next_steps && result.next_steps.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Next Steps</h3>
              <ul className="space-y-2">
                {result.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-cyan-400 mt-0.5">→</span>
                    {step}
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
