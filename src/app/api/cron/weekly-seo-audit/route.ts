import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runSEOAudit } from '@/lib/agents/seo-audit-agent';

// Vercel Cron: runs every Monday at 8am UTC
// Schedule: 0 8 * * 1
export const maxDuration = 300; // 5 minutes for cron jobs

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron or an authorized admin
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'rankmind-cron-secret-2024';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: Array<{ userId: string; url: string; status: string; score?: number }> = [];
  const errors: Array<{ userId: string; error: string }> = [];

  try {
    // Get all active paid users with a website_url set
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, website_url, plan_name, subscription_status')
      .in('plan_name', ['starter', 'growth', 'enterprise'])
      .eq('subscription_status', 'active')
      .not('website_url', 'is', null);

    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users', details: usersError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No eligible users found', results: [] });
    }

    // Run SEO audit for each user (sequentially to avoid rate limits)
    for (const user of users) {
      try {
        const auditResult = await runSEOAudit(user.website_url, user.email);

        // Store audit result in the audits table
        await supabase.from('audits').insert({
          user_id: user.id,
          url: user.website_url,
          score: auditResult.overall_score,
          grade: auditResult.grade,
          issues: auditResult.action_plan,
          recommendations: auditResult.llm_recommendations,
          raw_data: auditResult,
          audit_type: 'weekly_cron',
          created_at: new Date().toISOString(),
        });

        results.push({
          userId: user.id,
          url: user.website_url,
          status: 'success',
          score: auditResult.overall_score,
        });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ userId: user.id, error: errMsg });
        results.push({ userId: user.id, url: user.website_url, status: 'failed' });
      }
    }

    return NextResponse.json({
      message: `Weekly SEO audit cron completed`,
      total: users.length,
      succeeded: results.filter((r) => r.status === 'success').length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Cron job failed:', errMsg);
    return NextResponse.json({ error: 'Cron job failed', details: errMsg }, { status: 500 });
  }
}
