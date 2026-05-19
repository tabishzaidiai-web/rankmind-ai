import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3, Globe, Link2, FileText, TrendingUp,
  AlertCircle, CheckCircle2, Clock, Zap, ArrowRight, Plus
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's first website
  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  // Fallback: fetch website_url from users table (for accounts that completed onboarding before websites table was fixed)
  const { data: userProfile } = !website
    ? await supabase.from('users').select('website_url, onboarding_completed').eq('id', user?.id ?? '').single()
    : { data: null };
  const fallbackWebsite = !website && userProfile?.website_url
    ? { id: null as string | null, url: userProfile.website_url as string, domain: (userProfile.website_url as string).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0], niche: null as string | null }
    : null;
  const effectiveWebsite = website ?? fallbackWebsite;

  // Fetch latest audit
  const { data: latestAudit } = website
    ? await supabase
        .from('audits')
        .select('score, grade, created_at')
        .eq('website_id', website.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  // Fetch latest GEO score
  const { data: latestGeo } = website
    ? await supabase
        .from('geo_scores')
        .select('visibility_score, created_at')
        .eq('website_id', website.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  // Fetch keyword counts
  const { count: keywordCount } = website
    ? await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
    : { count: 0 };

  const { count: top10Count } = website
    ? await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
        .lte('ranking_position', 10)
        .not('ranking_position', 'is', null)
    : { count: 0 };

  // Fetch content counts
  const { count: contentPending } = website
    ? await supabase
        .from('content_queue')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
        .eq('status', 'pending_approval')
    : { count: 0 };

  const { count: contentPublished } = website
    ? await supabase
        .from('content_queue')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
        .eq('status', 'published')
    : { count: 0 };

  // Fetch backlink counts
  const { count: backlinkTotal } = website
    ? await supabase
        .from('backlink_opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
        .eq('status', 'published')
    : { count: 0 };

  const { count: backlinkPending } = website
    ? await supabase
        .from('backlink_opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', website.id)
        .eq('status', 'pending_approval')
    : { count: 0 };

  // Fetch agent activity
  const { data: activity } = user
    ? await supabase
        .from('agent_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8)
    : { data: [] };

  const seoScore = latestAudit?.score ?? null;
  const geoScore = latestGeo?.visibility_score ?? null;

  const scoreColor = (s: number | null) => {
    if (s === null) return 'text-white/40';
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const agentIcon = (agent: string) => {
    const map: Record<string, string> = {
      rankbot: '/agent-rankbot-transparent.png',
      linkbot: '/agent-linkbot-transparent.png',
      geog: '/agent-geog-transparent.png',
      contentai: '/agent-contentai-transparent.png',
    };
    return map[agent?.toLowerCase()] || null;
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          {effectiveWebsite ? (
            <p className="text-white/50 text-sm mt-0.5">{effectiveWebsite.domain}</p>
          ) : (
            <p className="text-white/50 text-sm mt-0.5">No website connected yet</p>
          )}
        </div>
        {!effectiveWebsite && (
          <Link
            href="/dashboard/onboarding"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Website
          </Link>
        )}
      </div>

      {/* No website state */}
      {!effectiveWebsite && (
        <div className="border border-dashed border-white/15 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex gap-3">
            {['/agent-rankbot-transparent.png','/agent-linkbot-transparent.png','/agent-geog-transparent.png','/agent-contentai-transparent.png'].map((src, i) => (
              <div key={i} className="w-14 h-14 relative opacity-60">
                <Image src={src} alt="Agent" fill className="object-contain" />
              </div>
            ))}
          </div>
          <h2 className="text-white font-semibold text-xl">Your AI SEO team is ready</h2>
          <p className="text-white/40 text-sm max-w-md">Complete your onboarding to connect your website and start your first SEO audit, keyword research, and content calendar.</p>
          <Link href="/dashboard/onboarding" className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all text-sm">
            <Zap className="w-4 h-4" />
            Complete Setup
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {effectiveWebsite && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Link href="/dashboard/seo-audit" className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-white/50 font-medium">SEO Health</span>
              </div>
              <div className={`text-3xl font-bold ${scoreColor(seoScore)}`}>
                {seoScore !== null ? seoScore : '\u2014'}
                {seoScore !== null && <span className="text-sm font-normal text-white/30">/100</span>}
              </div>
              {latestAudit?.grade && <div className="text-xs text-white/40 mt-1">Grade: {latestAudit.grade}</div>}
              {!latestAudit && <div className="text-xs text-white/30 mt-1">Run first audit \u2192</div>}
            </Link>

            <Link href="/dashboard/geo-score" className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/50 font-medium">GEO Visibility</span>
              </div>
              <div className={`text-3xl font-bold ${scoreColor(geoScore)}`}>
                {geoScore !== null ? `${geoScore}%` : '\u2014'}
              </div>
              <div className="text-xs text-white/30 mt-1">AI search presence</div>
            </Link>

            <Link href="/dashboard/keywords" className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/50 font-medium">Keywords</span>
              </div>
              <div className="text-3xl font-bold text-white">{keywordCount ?? 0}</div>
              <div className="text-xs text-white/30 mt-1">{top10Count ?? 0} in top 10</div>
            </Link>

            <Link href="/dashboard/content" className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-white/50 font-medium">Content</span>
              </div>
              <div className="text-3xl font-bold text-white">{contentPublished ?? 0}</div>
              <div className="text-xs text-white/30 mt-1">
                {(contentPending ?? 0) > 0
                  ? <span className="text-amber-400">{contentPending} awaiting approval</span>
                  : 'published articles'}
              </div>
            </Link>

            <Link href="/dashboard/backlinks" className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-white/50 font-medium">Backlinks</span>
              </div>
              <div className="text-3xl font-bold text-white">{backlinkTotal ?? 0}</div>
              <div className="text-xs text-white/30 mt-1">
                {(backlinkPending ?? 0) > 0
                  ? <span className="text-amber-400">{backlinkPending} need approval</span>
                  : 'live links'}
              </div>
            </Link>

            <div className="col-span-1 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-white/50 font-medium">Quick Action</span>
              </div>
              <div className="space-y-2">
                {(contentPending ?? 0) > 0 && (
                  <Link href="/dashboard/content" className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                    <AlertCircle className="w-3 h-3" />{contentPending} articles to review
                  </Link>
                )}
                {(backlinkPending ?? 0) > 0 && (
                  <Link href="/dashboard/backlinks" className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                    <AlertCircle className="w-3 h-3" />{backlinkPending} links to approve
                  </Link>
                )}
                {(contentPending ?? 0) === 0 && (backlinkPending ?? 0) === 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3" />All caught up!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">Agent Activity</h2>
                <span className="text-xs text-white/30">Live feed</span>
              </div>
              {activity && activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.map((item: { id: string; agent: string; action: string; details?: string; created_at: string }) => {
                    const icon = agentIcon(item.agent);
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        {icon ? (
                          <div className="w-8 h-8 relative flex-shrink-0">
                            <Image src={icon} alt={item.agent} fill className="object-contain" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-violet-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 leading-snug">{item.action}</p>
                          {item.details && <p className="text-xs text-white/40 mt-0.5 truncate">{item.details}</p>}
                        </div>
                        <span className="text-xs text-white/25 flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(item.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="flex gap-2">
                    {['/agent-rankbot-transparent.png','/agent-linkbot-transparent.png'].map((src, i) => (
                      <div key={i} className="w-10 h-10 relative opacity-40">
                        <Image src={src} alt="Agent" fill className="object-contain" />
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-sm">No agent activity yet</p>
                  <p className="text-white/20 text-xs">Run your first SEO audit to get started</p>
                  <Link href="/dashboard/seo-audit" className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 mt-1">
                    Run SEO Audit <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-white font-semibold">Your AI Agents</h2>
              {[
                { href: '/dashboard/seo-audit', src: '/agent-rankbot-transparent.png', name: 'RankBot', desc: 'SEO Audit Agent', color: 'hover:border-violet-500/30' },
                { href: '/dashboard/backlinks', src: '/agent-linkbot-transparent.png', name: 'LinkBot', desc: 'Backlink Builder', color: 'hover:border-teal-500/30' },
                { href: '/dashboard/content', src: '/agent-contentai-transparent.png', name: 'ContentAI', desc: 'Content Writer', color: 'hover:border-amber-500/30' },
                { href: '/dashboard/geo-score', src: '/agent-geog-transparent.png', name: 'GEO-G', desc: 'GEO Optimizer', color: 'hover:border-blue-500/30' },
              ].map(agent => (
                <Link
                  key={agent.href}
                  href={agent.href}
                  className={`flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl ${agent.color} transition-all group`}
                >
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <Image src={agent.src} alt={agent.name} fill className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{agent.name}</div>
                    <div className="text-white/40 text-xs">{agent.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
