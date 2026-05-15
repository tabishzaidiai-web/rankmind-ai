import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import stripe from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function updateUserSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  data: {
    subscription_id?: string | null;
    subscription_status?: string | null;
    plan_name?: string | null;
    price_id?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  }
) {
  const { error } = await supabase
    .from('users')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('[WEBHOOK_UPDATE_USER_ERROR]', error);
    throw new Error(`Failed to update user subscription: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error('[WEBHOOK_ERROR] Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('[WEBHOOK_ERROR] Missing STRIPE_WEBHOOK_SECRET env var');
    return NextResponse.json(
      { error: 'Webhook secret not configured.' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    console.error('[WEBHOOK_SIGNATURE_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== 'subscription') break;

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const planName = session.metadata?.plan_name ?? null;

        let subscription: Stripe.Subscription | null = null;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        }

        const priceId = subscription?.items?.data?.[0]?.price?.id ?? null;
        const currentPeriodEnd = subscription?.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await updateUserSubscription(supabase, customerId, {
          subscription_id: subscriptionId,
          subscription_status: subscription?.status ?? 'active',
          plan_name: planName,
          price_id: priceId,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
        });

        console.log(`[WEBHOOK] checkout.session.completed for customer: ${customerId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
        const planName =
          subscription.metadata?.plan_name ??
          subscription.items?.data?.[0]?.price?.nickname ??
          null;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await updateUserSubscription(supabase, customerId, {
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          plan_name: planName,
          price_id: priceId,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        console.log(`[WEBHOOK] customer.subscription.updated for customer: ${customerId}, status: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await updateUserSubscription(supabase, customerId, {
          subscription_id: subscription.id,
          subscription_status: 'cancelled',
          plan_name: null,
          price_id: null,
          current_period_end: null,
          cancel_at_period_end: false,
        });

        console.log(`[WEBHOOK] customer.subscription.deleted for customer: ${customerId}`);
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error: unknown) {
    console.error(`[WEBHOOK_HANDLER_ERROR] event: ${event.type}`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
