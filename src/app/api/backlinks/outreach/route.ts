/**
 * POST /api/backlinks/outreach
 *
 * Sends a personalised outreach email to a backlink prospect.
 * - If RESEND_API_KEY is set: sends via Resend (reply_to = user's auth email)
 * - If not: returns a mailto: link for the user's own email client
 *
 * Plan gating: Growth plan or above only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // ── Auth via Supabase session cookie ──
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ── Plan check: Growth+ only ──
    const plan: string = user.user_metadata?.selected_plan || 'free';
    if (plan === 'starter' || plan === 'free') {
      return NextResponse.json(
        {
          error: 'Outreach emails require the Growth plan or above.',
          upgradeRequired: true,
          currentPlan: plan,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { backlinkId, customMessage } = body;

    if (!backlinkId) {
      return NextResponse.json({ error: 'backlinkId is required' }, { status: 400 });
    }

    // ── Fetch the backlink row (service role for cross-user safety) ──
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: backlink, error: fetchError } = await serviceClient
      .from('backlink_opportunities')
      .select('*')
      .eq('id', backlinkId)
      .eq('user_id', user.id) // ensure ownership
      .single();

    if (fetchError || !backlink) {
      return NextResponse.json({ error: 'Backlink opportunity not found' }, { status: 404 });
    }

    if (!backlink.contact_email) {
      return NextResponse.json(
        { error: 'No contact email available for this prospect. Try enriching first.' },
        { status: 400 }
      );
    }

    // ── Build email content ──
    const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'RankMind User';
    const senderEmail = user.email!;
    const targetDomain = backlink.domain_name || 'your site';
    const userNiche = backlink.niche || backlink.keyword || 'your industry';

    const emailSubject =
      customMessage?.subject ||
      `Guest Post Inquiry — ${userNiche} Content for ${targetDomain}`;

    const emailBody =
      customMessage?.body ||
      `Hi there,\n\n` +
      `I came across ${targetDomain} and noticed you accept guest posts. ` +
      `I'd love to contribute a high-quality article that your readers would find valuable.\n\n` +
      `I specialise in ${userNiche} content and can cover topics like:\n` +
      `- Trending strategies and practical how-tos\n` +
      `- Data-driven insights and case studies\n` +
      `- Expert roundups and actionable guides\n\n` +
      `Would you be open to a guest contribution? I'm happy to follow your editorial guidelines.\n\n` +
      `Best regards,\n${senderName}\n${senderEmail}`;

    // ── Send via Resend if key is available ──
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderName} <outreach@rank-mind.com>`,
          reply_to: senderEmail,
          to: backlink.contact_email,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!sendRes.ok) {
        const err = await sendRes.text();
        console.error('[Outreach] Resend send failed:', err);
        // Fall through to mailto fallback
      } else {
        // Update backlink status to 'contacted'
        await serviceClient
          .from('backlink_opportunities')
          .update({
            status: 'contacted',
            contacted_at: new Date().toISOString(),
            outreach_email: senderEmail,
          })
          .eq('id', backlinkId);

        return NextResponse.json({
          success: true,
          method: 'sent',
          contactEmail: backlink.contact_email,
        });
      }
    }

    // ── Fallback: return mailto link for client-side sending ──
    const mailtoLink =
      `mailto:${encodeURIComponent(backlink.contact_email)}` +
      `?subject=${encodeURIComponent(emailSubject)}` +
      `&body=${encodeURIComponent(emailBody)}`;

    // Mark as contacted even for mailto (user is initiating contact)
    await serviceClient
      .from('backlink_opportunities')
      .update({
        status: 'contacted',
        contacted_at: new Date().toISOString(),
        outreach_email: senderEmail,
      })
      .eq('id', backlinkId);

    return NextResponse.json({
      success: true,
      method: 'mailto',
      mailtoLink,
      contactEmail: backlink.contact_email,
    });
  } catch (error) {
    console.error('[Outreach] Error:', error);
    const message = error instanceof Error ? error.message : 'Outreach failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
