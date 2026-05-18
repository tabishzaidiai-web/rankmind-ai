import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { priceId, planName } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required.' },
        { status: 400 }
      );
    }

    if (!planName) {
      return NextResponse.json(
        { error: 'Plan name is required.' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? profile?.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get('origin') ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success&plan=${encodeURIComponent(planName)}`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_name: planName,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        plan_name: planName,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message ?? 'Failed to create checkout session.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan') || 'starter';
  
  const PLAN_PRICE_MAP: Record<string, string> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
  };
  
  const priceId = PLAN_PRICE_MAP[plan];
  if (!priceId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL(`/login?redirect=/api/stripe/checkout?plan=${plan}`, request.url));
    }
    
    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single();
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.rank-mind.com';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success&plan=${plan}`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      subscription_data: { metadata: { supabase_user_id: user.id, plan_name: plan } },
      allow_promotion_codes: true,
    });
    
    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_GET_ERROR]', error);
    return NextResponse.redirect(new URL('/pricing', request.url));
  }
}
