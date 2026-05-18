import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.rank-mind.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/settings`,
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error('[STRIPE_PORTAL_ERROR]', error);
    return NextResponse.redirect(new URL('/dashboard/settings', request.url));
  }
}
