import { createClient } from '@/lib/supabase/server';
import DashboardOverviewClient from '@/components/dashboard/DashboardOverviewClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status')
    .eq('id', user?.id)
    .single();

  const plan = userData?.plan_name || 'free';
  const isActive = userData?.subscription_status === 'active';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <DashboardOverviewClient
      plan={plan}
      isActive={isActive}
      userName={userName}
    />
  );
}
