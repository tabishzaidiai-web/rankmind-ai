'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, avatar: null },
  { href: '/dashboard/seo-audit', label: 'SEO Audit', icon: null, avatar: '/agent-rankbot-transparent.png' },
  { href: '/dashboard/backlinks', label: 'Backlinks', icon: null, avatar: '/agent-linkbot-transparent.png' },
  { href: '/dashboard/geo-score', label: 'GEO Score', icon: null, avatar: '/agent-geog-transparent.png' },
  { href: '/dashboard/content', label: 'Content', icon: null, avatar: '/agent-contentai-transparent.png' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, avatar: null },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full w-[280px] bg-[#0d0d14] border-r border-white/10 fixed left-0 top-0 bottom-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon-v2.png" alt="RankMind AI" width={36} height={36} className="rounded-xl" />
          <span className="font-bold text-white text-lg">RankMind AI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.avatar ? (
                <Image
                  src={item.avatar}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain flex-shrink-0"
                />
              ) : item.icon ? (
                <item.icon className="w-4 h-4 flex-shrink-0" />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
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
