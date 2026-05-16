import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runBacklinkCampaign } from '@/lib/agents/backlink-agent';

// Vercel Cron: runs every Wednesday at 9am UTC
// Schedule: 0 9 * * 3
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'rankmind-cron-secret-2024';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: Array<{ userId: string; url: string; status: string; prospectsFound?: number }> = [];
  const errors: Array<{ userId: string; error: string }> = [];

  try {
    // Get Growth and Enterprise users with a website_url
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, website_url, plan_name, subscription_status')
      .in('plan_name', ['growth', 'enterprise'])
      .eq('subscription_status', 'active')
      .not('website_url', 'is', null);

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users', details: usersError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No eligible users found', results: [] });
    }

    for (const user of users) {
      try {
        const backlinkResult = await runBacklinkCampaign(user.website_url, user.email);

        results.push({
          userId: user.id,
          url: user.website_url,
          status: 'success',
          prospectsFound: backlinkResult.opportunities?.length || 0,
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ userId: user.id, error: errMsg });
        results.push({ userId: user.id, url: user.website_url, status: 'failed' });
      }
    }

    return NextResponse.json({
      message: 'Weekly backlink cron completed',
      total: users.length,
      succeeded: results.filter((r) => r.status === 'success').length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Cron job failed', details: errMsg }, { status: 500 });
  }
}
