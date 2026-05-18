'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BarChart3, Download, Mail, FileText, TrendingUp, Globe, Link2, Loader2, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReportSummary {
  seoScore: number | null;
  geoScore: number | null;
  keywordCount: number;
  top10Count: number;
  contentPublished: number;
  backlinkCount: number;
  period: string;
}

export default function ReportsPage() {
  const [website, setWebsite] = useState<{ id: string; domain: string } | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: ws } = await supabase.from('websites').select('id, domain').order('created_at', { ascending: true }).limit(1).single();
    if (!ws) return;
    setWebsite(ws);

    const [auditRes, geoRes, kwRes, kw10Res, contentRes, blRes] = await Promise.all([
      supabase.from('audits').select('score').eq('website_id', ws.id).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('geo_scores').select('visibility_score').eq('website_id', ws.id).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('website_id', ws.id),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('website_id', ws.id).lte('ranking_position', 10).not('ranking_position', 'is', null),
      supabase.from('content_queue').select('*', { count: 'exact', head: true }).eq('website_id', ws.id).eq('status', 'published'),
      supabase.from('backlink_opportunities').select('*', { count: 'exact', head: true }).eq('website_id', ws.id).eq('status', 'published'),
    ]);

    setSummary({
      seoScore: auditRes.data?.score ?? null,
      geoScore: geoRes.data?.visibility_score ?? null,
      keywordCount: kwRes.count ?? 0,
      top10Count: kw10Res.count ?? 0,
      contentPublished: contentRes.count ?? 0,
      backlinkCount: blRes.count ?? 0,
      period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sendEmailReport = async () => {
    setLoading(true); setError(''); setEmailSent(false);
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ websiteId: website?.id, type: 'email' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send report');
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setGenerating(true); setError('');
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ websiteId: website?.id, type: 'pdf' }) });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${website?.domain}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const scoreColor = (s: number | null) => {
    if (s === null) return 'text-white/40';
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/50 text-sm">Monthly SEO performance reports — email or download as PDF</p>
        </div>
      </div>

      {/* Report preview card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {/* Report header */}
        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image src="/logo.png" alt="RankMind AI" width={24} height={24} className="rounded" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                <span className="text-white/70 text-sm font-medium">RankMind AI</span>
              </div>
              <h2 className="text-white font-bold text-xl">Monthly SEO Report</h2>
              <p className="text-white/50 text-sm">{summary?.period || 'Loading...'} · {website?.domain || 'your website'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={sendEmailReport}
                disabled={loading || !website}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                {emailSent ? 'Sent!' : 'Email Report'}
              </button>
              <button
                onClick={downloadPDF}
                disabled={generating || !website}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.05]">
          {[
            { icon: <BarChart3 className="w-4 h-4 text-violet-400" />, label: 'SEO Health Score', value: summary?.seoScore !== null && summary?.seoScore !== undefined ? `${summary.seoScore}/100` : '—', color: scoreColor(summary?.seoScore ?? null) },
            { icon: <Globe className="w-4 h-4 text-blue-400" />, label: 'GEO Visibility', value: summary?.geoScore !== null && summary?.geoScore !== undefined ? `${summary.geoScore}%` : '—', color: scoreColor(summary?.geoScore ?? null) },
            { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: 'Keywords Tracked', value: summary?.keywordCount?.toString() || '0', color: 'text-white' },
            { icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, label: 'Keywords in Top 10', value: summary?.top10Count?.toString() || '0', color: 'text-white' },
            { icon: <FileText className="w-4 h-4 text-amber-400" />, label: 'Articles Published', value: summary?.contentPublished?.toString() || '0', color: 'text-white' },
            { icon: <Link2 className="w-4 h-4 text-teal-400" />, label: 'Live Backlinks', value: summary?.backlinkCount?.toString() || '0', color: 'text-white' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-white/50 font-medium">{stat.label}</span></div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Agents summary */}
        <div className="p-6 border-t border-white/10">
          <h3 className="text-white font-semibold mb-4 text-sm">Agent Activity This Month</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { src: '/agent-rankbot-transparent.png', name: 'RankBot', action: 'SEO Audit', status: summary?.seoScore ? 'Completed' : 'Pending' },
              { src: '/agent-linkbot-transparent.png', name: 'LinkBot', action: 'Backlink Research', status: (summary?.backlinkCount ?? 0) > 0 ? `${summary?.backlinkCount} links` : 'Pending' },
              { src: '/agent-contentai-transparent.png', name: 'ContentAI', action: 'Content Writing', status: (summary?.contentPublished ?? 0) > 0 ? `${summary?.contentPublished} articles` : 'Pending' },
              { src: '/agent-geog-transparent.png', name: 'GEO-G', action: 'GEO Scoring', status: summary?.geoScore ? `${summary.geoScore}% visible` : 'Pending' },
            ].map(agent => (
              <div key={agent.name} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image src={agent.src} alt={agent.name} fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-medium">{agent.name}</div>
                  <div className="text-white/40 text-[10px] truncate">{agent.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Scheduled reports info */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3 text-sm">Automatic Weekly Reports</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          RankMind AI automatically emails you a weekly performance summary every Monday morning. The report includes your SEO health score, keyword position changes, new content published, and backlinks acquired that week.
        </p>
        <p className="text-white/30 text-xs mt-2">Reports are sent to your account email address. Configure delivery preferences in Settings → Notifications.</p>
      </div>
    </div>
  );
}
