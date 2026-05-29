import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Mail, Globe, Star, TrendingUp, CheckCircle2 } from 'lucide-react';

// ── Safe data fetcher — returns null on any error ──
async function getBacklink(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('backlink_opportunities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

function daColor(da: number | null | undefined) {
  if (da == null) return 'text-white/40';
  if (da >= 60) return 'text-emerald-400';
  if (da >= 40) return 'text-amber-400';
  return 'text-white/60';
}

function relevanceColor(r: number | null | undefined) {
  if (r == null) return 'text-white/40';
  if (r >= 8) return 'text-emerald-400';
  if (r >= 6) return 'text-amber-400';
  return 'text-white/60';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-white/10 text-white/50',
    outreach_sent: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-amber-500/20 text-amber-400',
    published: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
  };
  return map[status] || 'bg-white/10 text-white/50';
}

export default async function BacklinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const backlink = await getBacklink(id);

  // ── Not found / error state ──
  if (!backlink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
          <Globe className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Backlink Not Found</h2>
        <p className="text-white/40 text-sm max-w-sm mb-6">
          This opportunity could not be loaded. It may still be processing or may have been removed.
        </p>
        <Link
          href="/dashboard/backlinks"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to LinkBot
        </Link>
      </div>
    );
  }

  // ── Safe accessors using correct column names ──
  const domain = backlink.domain_name || 'Pending Enrichment';
  const siteUrl = backlink.site_url || '#';
  const da = backlink.estimated_da ?? null;
  const email = backlink.contact_email || null;
  const relevance = backlink.niche_relevance ?? null;
  const type = backlink.site_type || 'guest_post';
  const status = backlink.status || 'pending';
  const keyword = backlink.keyword || null;
  const anchorText = backlink.anchor_text || null;
  const dofollow = backlink.dofollow ?? true;
  const scheduledDate = backlink.scheduled_date
    ? new Date(backlink.scheduled_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;
  const createdAt = backlink.created_at
    ? new Date(backlink.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Back button */}
      <Link
        href="/dashboard/backlinks"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to LinkBot
      </Link>

      {/* Header card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">{domain}</h1>
            {siteUrl !== '#' && (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 transition-colors mt-1"
              >
                {siteUrl.length > 60 ? siteUrl.slice(0, 60) + '…' : siteUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge(status)}`}>
            {status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white/30" />
            <span className="text-white/50">DA</span>
            <span className={`font-bold ${daColor(da)}`}>{da ?? 'N/A'}</span>
          </div>
          <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400/60" />
            <span className="text-white/50">Relevance</span>
            <span className={`font-bold ${relevanceColor(relevance)}`}>
              {relevance != null ? `${relevance}/10` : 'N/A'}
            </span>
          </div>
          <div className="bg-teal-500/10 text-teal-400 rounded-xl px-3 py-2 capitalize text-xs font-medium">
            {type.replace(/_/g, ' ')}
          </div>
          <div className={`rounded-xl px-3 py-2 text-xs font-medium ${dofollow ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
            {dofollow ? 'Dofollow' : 'Nofollow'}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {email && (
            <div className="col-span-2">
              <span className="text-white/40 block mb-1">Contact Email</span>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {email}
              </a>
            </div>
          )}

          {keyword && (
            <div>
              <span className="text-white/40 block mb-1">Target Keyword</span>
              <span className="text-white">{keyword}</span>
            </div>
          )}

          {anchorText && (
            <div>
              <span className="text-white/40 block mb-1">Anchor Text</span>
              <span className="text-white">{anchorText}</span>
            </div>
          )}

          {scheduledDate && (
            <div>
              <span className="text-white/40 block mb-1">Scheduled Date</span>
              <span className="text-white">{scheduledDate}</span>
            </div>
          )}

          {createdAt && (
            <div>
              <span className="text-white/40 block mb-1">Found On</span>
              <span className="text-white">{createdAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {siteUrl !== '#' && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Site
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-all"
          >
            <Mail className="w-4 h-4" />
            Send Outreach
          </a>
        )}
        <Link
          href="/dashboard/backlinks"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium rounded-xl transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Back to LinkBot
        </Link>
      </div>
    </div>
  );
}
