'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Globe, BarChart3, TrendingUp, ArrowRight, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Client {
  id: string;
  domain: string;
  url: string;
  niche: string;
  country: string;
  created_at: string;
  seo_score?: number | null;
  geo_score?: number | null;
  keyword_count?: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newDesc, setNewDesc] = useState('');

  const loadClients = useCallback(async () => {
    const supabase = createClient();
    const { data: websites } = await supabase
      .from('websites')
      .select('id, domain, url, niche, country, created_at')
      .order('created_at', { ascending: false });

    if (!websites) { setLoading(false); return; }

    // Enrich with latest scores
    const enriched = await Promise.all(websites.map(async (ws) => {
      const [auditRes, geoRes, kwRes] = await Promise.all([
        supabase.from('audits').select('score').eq('website_id', ws.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('geo_scores').select('visibility_score').eq('website_id', ws.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('website_id', ws.id),
      ]);
      return {
        ...ws,
        seo_score: auditRes.data?.score ?? null,
        geo_score: geoRes.data?.visibility_score ?? null,
        keyword_count: kwRes.count ?? 0,
      };
    }));

    setClients(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const addClient = async () => {
    if (!newUrl.trim()) { setError('Website URL is required'); return; }
    setAdding(true); setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const normalized = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      const domain = new URL(normalized).hostname.replace('www.', '');

      const { error: insertError } = await supabase.from('websites').insert({
        user_id: user.id,
        url: normalized,
        domain,
        niche: newNiche,
        country: newCountry,
        business_description: newDesc,
        target_countries: [newCountry],
        language: 'English',
      });

      if (insertError) throw insertError;
      setShowAdd(false);
      setNewUrl(''); setNewNiche(''); setNewDesc('');
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
    } finally {
      setAdding(false);
    }
  };

  const scoreColor = (s: number | null | undefined) => {
    if (s == null) return 'text-white/30';
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-white/50 text-sm">Manage multiple websites and client accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Add New Client Website</h2>
              <button onClick={() => { setShowAdd(false); setError(''); }} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Website URL *</label>
                <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://clientsite.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Business Niche</label>
                <input type="text" value={newNiche} onChange={e => setNewNiche(e.target.value)} placeholder="e.g. Plumbing, E-commerce, SaaS" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Target Country</label>
                <input type="text" value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="United States" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Brief description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this client's business do?" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm resize-none" />
              </div>
            </div>
            {error && <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setError(''); }} className="flex-1 py-2.5 border border-white/15 text-white/50 rounded-xl text-sm hover:border-white/25 transition-colors">Cancel</button>
              <button onClick={addClient} disabled={adding} className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {adding ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : clients.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-cyan-400/60" />
          </div>
          <h2 className="text-white font-semibold">No clients yet</h2>
          <p className="text-white/40 text-sm max-w-sm">Add your first client website to start managing their SEO, content, and backlinks from one place.</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" />Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-cyan-500/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{client.domain}</div>
                    <div className="text-white/30 text-xs">{client.niche || 'No niche set'}</div>
                  </div>
                </div>
                <span className="text-xs text-white/20">{client.country}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-white/[0.03] rounded-lg">
                  <div className={`text-lg font-bold ${scoreColor(client.seo_score)}`}>{client.seo_score ?? '—'}</div>
                  <div className="text-[10px] text-white/30">SEO</div>
                </div>
                <div className="text-center p-2 bg-white/[0.03] rounded-lg">
                  <div className={`text-lg font-bold ${scoreColor(client.geo_score)}`}>{client.geo_score ? `${client.geo_score}%` : '—'}</div>
                  <div className="text-[10px] text-white/30">GEO</div>
                </div>
                <div className="text-center p-2 bg-white/[0.03] rounded-lg">
                  <div className="text-lg font-bold text-white">{client.keyword_count ?? 0}</div>
                  <div className="text-[10px] text-white/30">KWs</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/seo-audit?site=${encodeURIComponent(client.url)}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all">
                  <BarChart3 className="w-3 h-3" />Audit
                </Link>
                <Link href={`/dashboard/reports?websiteId=${client.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all">
                  <TrendingUp className="w-3 h-3" />Report
                </Link>
                <Link href={`/dashboard/content?websiteId=${client.id}`} className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agency features note */}
      {clients.length > 0 && (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 text-sm">Agency Features</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            White-label PDF reports, bulk content approvals, and client portal access are available on the Agency and Enterprise plans. Each client website has its own isolated keyword tracking, content queue, and backlink pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
