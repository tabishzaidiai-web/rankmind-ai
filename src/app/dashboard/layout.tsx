import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { DashboardVoiceAgent } from '@/components/DashboardVoiceAgent';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user plan for the voice agent
  const { data: userData } = await supabase
    .from('users')
    .select('plan_name')
    .eq('id', user.id)
    .single();
  const plan = userData?.plan_name || 'starter';

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Persistent Sidebar — always visible on desktop */}
      <aside className="hidden md:block flex-shrink-0 w-[280px]">
        <Sidebar user={user} />
      </aside>

      {/* Main Content — takes remaining width */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0a0a0f]">
          {children}
        </main>
      </div>

      {/* Gemini Voice Agent — Paid Mode (all 7 agents available) */}
      <DashboardVoiceAgent plan={plan} />
    </div>
  );
}
