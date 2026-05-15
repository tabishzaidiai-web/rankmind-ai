'use client';
import { Bell } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function TopBar({ user }: { user: User }) {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm flex items-center justify-between px-8 flex-shrink-0">
      <div className="text-sm text-white/40">
        Welcome back, <span className="text-white font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'}</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
