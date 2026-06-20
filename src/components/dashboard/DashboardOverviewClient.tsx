'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, CheckCircle2, Circle, X, Globe, BarChart3, Link2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ActivityFeed from './ActivityFeed';

const AGENTS = [
  {
    href: '/dashboard/seo-audit',
    avatar: '/agent-rankbot-transparent.png',
    name: 'RankBot',
    title: 'SEO Audit Agent',
    description: 'Deep crawls your website, scores 10 key SEO factors, and creates a prioritized action plan.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    border: 'border-violet-500/30',
    bg: 'from-violet-500/10 to-transparent',
    btnColor: 'bg-violet-600 hover:bg-violet-500',
    badge: 'Starter+',
    available: true,
    statLabel: 'Audits Run',
    statIcon: BarChart3,
    statColor: 'text-violet-400',
  },
  {
    href: '/dashboard/backlinks',
    avatar: '/agent-linkbot-transparent.png',
    name: 'LinkBot',
    title: 'Backlink Builder',
    description: 'Finds real high-authority websites in your niche, writes guest posts, sends outreach emails automatically.',
    color: '#0d9488',
    glow: 'rgba(13,148,136,0.35)',
    border: 'border-teal-500/30',
    bg: 'from-teal-500/10 to-transparent',
    btnColor: 'bg-teal-600 hover:bg-teal-500',
    badge: 'Growth+',
    available: false,
    statLabel: 'Backlinks Found',
    statIcon: Link2,
    statColor: 'text-teal-400',
  },
  {
    href: '/dashboard/geo-score',
    avatar: '/agent-geog-transparent.png',
    name: 'GEO-G',
    title: 'GEO Optimizer',
    description: 'Optimizes your content to appear in ChatGPT, Perplexity, and Google AI Overviews.',
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.35)',
    border: 'border-blue-500/30',
    bg: 'from-blue-500/10 to-transparent',
    btnColor: 'bg-blue-600 hover:bg-blue-500',
    badge: 'Enterprise',
    available: false,
    statLabel: 'GEO Score',
    statIcon: Globe,
    statColor: 'text-blue-400',
  },
  {
    href: '/dashboard/content',
    avatar: '/agent-contentai-transparent.png',
    name: 'ContentAI',
    title: 'Content Writer',
    description: 'Generates SEO-optimized blog posts, landing pages, and meta content that ranks.',
    color: '#d97706',
    glow: 'rgba(217,119,6,0.35)',
    border: 'border-amber-500/30',
    bg: 'from-amber-500/10 to-transparent',
    btnColor: 'bg-amber-600 hover:bg-amber-500',
    badge: 'Enterprise',
    available: false,
    statLabel: 'Content Created',
    statIcon: FileText,
    statColor: 'text-amber-400',
  },
];

const FLOAT_ANIMS = ['float1', 'float2', 'float3', 'float4'];
const FLOAT_DELAYS = ['0s', '0.6s', '1.2s', '1.8s'];

interface Props {
  plan: string;
  isActive: boolean;
  isAdmin?: boolean;
  userName: string;
}

export default function DashboardOverviewClient({ plan, isActive, isAdmin = false, userName }: Props) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [stats, setStats] = useState({ audits: 0, backlinks: 0, geoScore: '--', content: 0 });
  const [checklist, setChecklist] = useState([false, false, false]);

  useEffect(() => {
    const seen = localStorage.getItem('rm_welcome_seen');
    if (!seen) {
      setShowWelcome(true);
      localStorage.setItem('rm_welcome_seen', '1');
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [auditsRes, backlinksRes, contentRes] = await Promise.all([
          supabase.from('audit_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('backlink_campaigns').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('user_content').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);
        setStats({
          audits: auditsRes.count ?? 0,
          backlinks: backlinksRes.count ?? 0,
          geoScore: '--',
          content: contentRes.count ?? 0,
        });
      } catch (e) {
        console.error('[DashboardStats]', e);
      }
    };
    fetchStats();
  }, []);

  const handleChecklistToggle = (i: number) => {
    setChecklist((prev) => prev.map((v, idx) => idx === i ? !v : v));
  };

  const statValues = [String(stats.audits), String(stats.backlinks), stats.geoScore, String(stats.content)];

  return (
    <div className="space-y-8 relative">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(-5px)} 50%{transform:translateY(5px)} }
        @keyframes float3 { 0%,100%{transform:translateY(-3px)} 50%{transform:translateY(7px)} }
        @keyframes float4 { 0%,100%{transform:translateY(3px)} 50%{transform:translateY(-7px)} }
      `}</style>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to RankMind AI! 👋</h2>
              <p className="text-white/60 text-sm">Meet your AI SEO team — they work 24/7 so you don&apos;t have to</p>
            </div>
            {/* 4 avatars in a row */}
            <div className="flex justify-center gap-4 mb-6">
              {AGENTS.map((agent, i) => (
                <div key={agent.name} className="flex flex-col items-center gap-1">
                  <div style={{ animation: `${FLOAT_ANIMS[i]} 2.5s ease-in-out infinite`, animationDelay: FLOAT_DELAYS[i], filter: `drop-shadow(0 0 10px ${agent.glow})` }}>
                    <Image src={agent.avatar} alt={agent.name} width={64} height={64} className="w-14 h-14 object-contain" />
                  </div>
                  <span className="text-xs text-white/50 font-medium">{agent.name}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/seo-audit"
              onClick={() => setShowWelcome(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Start with a Free SEO Audit <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setShowWelcome(false)} className="w-full mt-3 text-sm text-white/40 hover:text-white/70 transition-colors">
              Explore dashboard first
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {userName} 👋</h1>
        <p className="text-white/50 mt-1">Your AI-powered SEO command center</p>
      </div>

      {/* Website URL Input */}
      <div className="bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-2xl p-5">
        <p className="text-sm font-medium text-white/70 mb-3">Enter your website to get started</p>
        <div className="flex gap-3">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <Link
            href={`/dashboard/seo-audit${websiteUrl ? `?url=${encodeURIComponent(websiteUrl)}` : ''}`}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
          >
            Run SEO Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Plan Banner — hidden for admin accounts */}
      {!isActive && !isAdmin && (
        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="font-semibold text-white">You&apos;re on the Free plan</div>
              <div className="text-sm text-white/50">Upgrade to unlock all AI agents and automation</div>
            </div>
          </div>
          <Link href="/#pricing" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stats Row with avatar watermarks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENTS.map((agent, i) => (
          <div key={agent.statLabel} className="relative bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
            {/* Watermark avatar */}
            <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
              <Image src={agent.avatar} alt="" width={80} height={80} className="w-20 h-20 object-contain" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <agent.statIcon className={`w-4 h-4 ${agent.statColor}`} />
              <span className="text-xs text-white/50">{agent.statLabel}</span>
            </div>
            <div className="text-2xl font-bold text-white relative z-10">{statValues[i]}</div>
            {i === 2 && (
              <div className="text-xs text-white/40 mt-1 relative z-10">Run your first GEO scan</div>
            )}
          </div>
        ))}
      </div>

      {/* Live Activity Feed & Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Your AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={`relative bg-gradient-to-br ${agent.bg} border ${agent.border} rounded-2xl p-6 overflow-hidden`}
            >
              {/* Radial glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${agent.color} 0%, transparent 70%)` }} />
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div style={{ animation: `${FLOAT_ANIMS[i]} 3s ease-in-out infinite`, animationDelay: FLOAT_DELAYS[i], filter: `drop-shadow(0 4px 12px ${agent.glow})`, flexShrink: 0 }}>
                  <Image src={agent.avatar} alt={agent.name} width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{agent.name}</h3>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{agent.badge}</span>
                  </div>
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2">{agent.title}</p>
                  <p className="text-sm text-white/60 mb-4">{agent.description}</p>
                  <Link
                    href={agent.href}
                    className={`inline-flex items-center gap-2 ${agent.btnColor} text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all`}
                    style={{ boxShadow: `0 0 16px ${agent.glow}` }}
                  >
                    Run Agent <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Checklist */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-violet-400" />
          Getting Started
        </h2>
        <div className="space-y-3">
          {[
            { text: 'Add your website URL above', href: '#' },
            { text: 'Run your first SEO Audit with RankBot', href: '/dashboard/seo-audit' },
            { text: 'Build backlinks with LinkBot', href: '/dashboard/backlinks' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => handleChecklistToggle(i)}>
              <div className="flex-shrink-0">
                {checklist[i]
                  ? <CheckCircle2 className="w-5 h-5 text-violet-400" />
                  : <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                }
              </div>
              <span className={`text-sm transition-colors ${checklist[i] ? 'text-white/40 line-through' : 'text-white/70 group-hover:text-white'}`}>
                {item.text}
              </span>
              {!checklist[i] && (
                <Link href={item.href} onClick={(e) => e.stopPropagation()} className="ml-auto">
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-violet-400 transition-colors" />
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/5 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(checklist.filter(Boolean).length / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/40">{checklist.filter(Boolean).length}/3 done</span>
          </div>
        </div>
      </div>
    </div>
  );
}
