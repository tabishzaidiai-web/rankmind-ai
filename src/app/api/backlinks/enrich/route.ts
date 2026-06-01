/**
 * POST /api/backlinks/enrich
 *
 * Re-enriches existing backlink_opportunities rows that have
 * domain_name = null or "Pending Enrichment" by fetching fresh
 * data from the SERPER API.
 *
 * Requires authentication + Growth plan or above.
 * Body: { niche: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { searchBacklinkOpportunities } from '@/lib/serper';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getUserPlanFromUser } from '@/lib/plan-middleware';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Plan check: Growth+ only ──
    const userPlan = getUserPlanFromUser(user);
    if (!userPlan.limits.backlinkBuilderAccess) {
      return NextResponse.json(
        {
          error: 'Backlink enrichment requires the Growth plan or above.',
          upgradeRequired: true,
          currentPlan: userPlan.plan,
        },
        { status: 403 }
      );
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { niche } = body;

    if (!niche) {
      return NextResponse.json({ error: 'niche is required' }, { status: 400 });
    }

    // Scope to the authenticated user's rows only
    const { data: pendingRows, error: fetchError } = await serviceClient
      .from('backlink_opportunities')
      .select('*')
      .eq('user_id', user.id)
      .or('domain_name.is.null,domain_name.eq.Pending Enrichment,domain_name.eq.unknown');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingRows || pendingRows.length === 0) {
      return NextResponse.json({ message: 'No pending rows to enrich', enriched: 0 });
    }

    console.log(`[Enrich] Found ${pendingRows.length} pending rows for niche: "${niche}"`);

    const opportunities = await searchBacklinkOpportunities(niche);

    if (opportunities.length === 0) {
      return NextResponse.json({
        message: 'SERPER returned no results — check SERPER_API_KEY in Vercel env vars',
        enriched: 0,
      });
    }

    let enriched = 0;

    for (let i = 0; i < pendingRows.length; i++) {
      const row = pendingRows[i];
      const match = opportunities[i % opportunities.length];
      if (!match) continue;

      const { error: updateError } = await serviceClient
        .from('backlink_opportunities')
        .update({
          domain_name: match.domain_name,
          site_url: match.site_url,
          estimated_da: match.estimated_da,
          contact_email: match.contact_email,
          niche_relevance: match.niche_relevance,
          site_type: match.site_type,
        })
        .eq('id', row.id);

      if (!updateError) {
        enriched++;
      } else {
        console.error(`[Enrich] Failed to update row ${row.id}:`, updateError.message);
      }
    }

    console.log(`[Enrich] Enriched ${enriched}/${pendingRows.length} rows`);
    return NextResponse.json({ success: true, enriched, total: pendingRows.length });
  } catch (error) {
    console.error('[Enrich] Error:', error);
    const message = error instanceof Error ? error.message : 'Enrichment failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
