'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Check, X, Eye, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QueueItem {
  id: string;
  title: string;
  target_keyword: string;
  word_count: number;
  status: string;
  created_at: string;
  content?: string;
  website_id?: string;
  website_domain?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_approval: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  published:        { label: 'Published', color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:         { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
  draft:            { label: 'Draft', color: 'text-white/40 bg-white/5 border-white/10', icon: <FileText className="w-3 h-3" /> },
};

export default function ContentQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'published' | 'rejected'>('all');
  const [preview, setPreview] = useState<QueueItem | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get all websites for this user
    const { data: websites } = await supabase
      .from('websites')
      .select('id, domain')
      .order('created_at', { ascending: true });

    if (!websites || websites.length === 0) { setLoading(false); return; }

    // Get content queue items for all websites
    const websiteIds = websites.map(w => w.id);
    const { data: queueData } = await supabase
      .from('content_queue')
      .select('id, title, target_keyword, word_count, status, created_at, content, website_id')
      .in('website_id', websiteIds)
      .order('created_at', { ascending: false });

    if (!queueData) { setLoading(false); return; }

    // Enrich with domain
    const domainMap = Object.fromEntries(websites.map(w => [w.id, w.domain]));
    const enriched = queueData.map(item => ({
      ...item,
      website_domain: domainMap[item.website_id] || 'Unknown',
    }));

    setItems(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const supabase = createClient();
    await supabase.from('content_queue').update({ status }).eq('id', id);
    await loadQueue();
    setUpdating(null);
  };

  const copyContent = async (item: QueueItem) => {
    if (!item.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const pendingCount = items.filter(i => i.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              Content Queue
            </h1>
            <p className="text-white/40 text-sm mt-1">Review and approve AI-generated articles before publishing</p>
          </div>
          <button
            onClick={loadQueue}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Articles', value: items.length, color: 'text-white' },
            { label: 'Pending Review', value: pendingCount, color: 'text-amber-400' },
            { label: 'Published', value: items.filter(i => i.status === 'published').length, color: 'text-green-400' },
            { label: 'Rejected', value: items.filter(i => i.status === 'rejected').length, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending_approval', 'published', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
              {f === 'pending_approval' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            Loading queue…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No articles {filter !== 'all' ? `with status "${STATUS_CONFIG[filter]?.label}"` : 'yet'}</p>
            <p className="text-xs mt-1 text-white/20">Generate articles in ContentAI to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
              return (
                <div
                  key={item.id}
                  className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${sc.color}`}>
                          {sc.icon}{sc.label}
                        </span>
                        {item.website_domain && (
                          <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{item.website_domain}</span>
                        )}
                        <span className="text-[11px] text-white/25">{item.word_count?.toLocaleString() || '—'} words</span>
                      </div>
                      <h3 className="font-semibold text-white leading-snug mb-1 truncate">{item.title || 'Untitled Article'}</h3>
                      <p className="text-xs text-white/40">
                        Keyword: <span className="text-violet-400">{item.target_keyword || '—'}</span>
                        <span className="mx-2 text-white/20">·</span>
                        {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.content && (
                        <button
                          onClick={() => copyContent(item)}
                          title="Copy article content"
                          className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                        >
                          {copied === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                      {item.content && (
                        <button
                          onClick={() => setPreview(item)}
                          title="Preview article"
                          className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {item.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => updateStatus(item.id, 'published')}
                            disabled={updating === item.id}
                            title="Approve & publish"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all disabled:opacity-50"
                          >
                            {updating === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(item.id, 'rejected')}
                            disabled={updating === item.id}
                            title="Reject"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === 'published' && (
                        <button
                          onClick={() => updateStatus(item.id, 'pending_approval')}
                          className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                        >
                          Unpublish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-16 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setPreview(null); }}
        >
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-6 max-w-3xl w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{preview.title}</h2>
                <p className="text-xs text-white/40 mt-0.5">Keyword: {preview.target_keyword} · {preview.word_count?.toLocaleString()} words</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyContent(preview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/8 text-white/60 hover:bg-white/12 transition-all"
                >
                  {copied === preview.id ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={() => setPreview(null)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
              <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">{preview.content}</pre>
            </div>
            {preview.status === 'pending_approval' && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { updateStatus(preview.id, 'published'); setPreview(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                >
                  Approve & Publish
                </button>
                <button
                  onClick={() => { updateStatus(preview.id, 'rejected'); setPreview(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
