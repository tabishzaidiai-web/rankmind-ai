import { createClient } from '@/lib/supabase/server';
import DashboardOverviewClient from '@/components/dashboard/DashboardOverviewClient';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'tabishzaidi.ai@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status')
    .eq('id', user?.id)
    .single();

  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  // Admin accounts get full Enterprise access without payment
  const plan = isAdmin ? 'enterprise' : (userData?.plan_name || 'free');
  const isActive = isAdmin ? true : (userData?.subscription_status === 'active');
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <DashboardOverviewClient
      plan={plan}
      isActive={isActive}
      isAdmin={isAdmin}
      userName={userName}
    />
  );
}
