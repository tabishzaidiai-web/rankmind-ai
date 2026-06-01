/**
 * POST /api/backlinks/enrich-emails
 *
 * Enriches contact_email for backlink_opportunities rows that have
 * contact_email = null or '-' by scraping the site's contact page
 * via the SERPER API.
 *
 * Requires authentication. Scoped to the authenticated user's rows.
 */
import { NextRequest, NextResponse } from 'next/server';
import { enrichContactEmail } from '@/lib/serper';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the user's rows without contact emails
    const { data: pendingRows, error: fetchError } = await serviceClient
      .from('backlink_opportunities')
      .select('id, domain_name, site_url, contact_email')
      .eq('user_id', user.id)
      .or('contact_email.is.null,contact_email.eq.-,contact_email.eq.');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingRows || pendingRows.length === 0) {
      return NextResponse.json({ message: 'No rows need email enrichment', enriched: 0 });
    }

    console.log(`[EnrichEmails] Processing ${pendingRows.length} rows for user ${user.id}`);

    let enriched = 0;
    for (const row of pendingRows) {
      if (!row.domain_name || !row.site_url) continue;

      const email = await enrichContactEmail(row.domain_name, row.site_url);
      if (email) {
        const { error: updateError } = await serviceClient
          .from('backlink_opportunities')
          .update({ contact_email: email })
          .eq('id', row.id);

        if (!updateError) {
          enriched++;
          console.log(`[EnrichEmails] Found email for ${row.domain_name}: ${email}`);
        }
      }
    }

    console.log(`[EnrichEmails] Enriched ${enriched}/${pendingRows.length} rows`);
    return NextResponse.json({
      success: true,
      enriched,
      total: pendingRows.length,
    });
  } catch (error) {
    console.error('[EnrichEmails] Error:', error);
    const message = error instanceof Error ? error.message : 'Email enrichment failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
