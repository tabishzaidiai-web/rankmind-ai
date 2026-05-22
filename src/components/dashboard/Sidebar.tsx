'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Settings, LogOut, Brain, Code2, RefreshCw, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const coreAgents = [
  { href: '/dashboard/seo-audit', label: 'RankBot', sublabel: 'SEO Audit + AI Readiness', avatar: '/agent-rankbot-transparent.png' },
  { href: '/dashboard/geo-score', label: 'GEO-G', sublabel: 'AI Mode Optimizer', avatar: '/agent-geog-transparent.png' },
  { href: '/dashboard/content', label: 'ContentAI', sublabel: 'Content Writer', avatar: '/agent-contentai-transparent.png' },
  { href: '/dashboard/backlinks', label: 'LinkBot', sublabel: 'Backlink Builder', avatar: '/agent-linkbot-transparent.png' },
];

const aiEraTools = [
  { href: '/dashboard/ai-citation', label: 'AI Citation Tracker', sublabel: 'Google AI Mode · ChatGPT · Perplexity', icon: Brain, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' },
  { href: '/dashboard/schema-generator', label: 'Schema Generator', sublabel: 'JSON-LD · Rich Results · AI Signals', icon: Code2, color: 'text-emerald-400', activeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
  { href: '/dashboard/freshness', label: 'Freshness Monitor', sublabel: '90-day decay alerts · Refresh planner', icon: RefreshCw, color: 'text-orange-400', activeBg: 'bg-orange-500/20 border-orange-500/30 text-orange-300' },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <div className="flex flex-col h-full w-[280px] bg-[#0d0d14] border-r border-white/10 fixed left-0 top-0 bottom-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon-v2.png" alt="RankMind AI" width={34} height={34} className="rounded-xl" />
          <div>
            <span className="font-bold text-white text-base leading-tight block">RankMind AI</span>
            <span className="text-[10px] text-cyan-400/70 leading-tight block">AI-Era SEO Platform</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-4">

        {/* Overview */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            isActive('/dashboard') && pathname === '/dashboard'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          Overview
        </Link>

        {/* Core AI Agents */}
        <div>
          <div className="flex items-center gap-1.5 px-3 mb-2">
            <Sparkles className="w-3 h-3 text-violet-400/60" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">AI Agents</span>
          </div>
          <div className="space-y-0.5">
            {coreAgents.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  }`}
                >
                  <Image
                    src={item.avatar}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-white/30 leading-tight truncate">{item.sublabel}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI-Era Tools */}
        <div>
          <div className="flex items-center gap-1.5 px-3 mb-2">
            <Brain className="w-3 h-3 text-cyan-400/60" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">AI-Era Tools</span>
            <span className="ml-auto text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">NEW</span>
          </div>
          <div className="space-y-0.5">
            {aiEraTools.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? `${item.activeBg} border`
                      : 'text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? '' : item.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-white/30 leading-tight truncate">{item.sublabel}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            isActive('/dashboard/settings')
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-white/40 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
