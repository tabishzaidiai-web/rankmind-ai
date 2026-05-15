import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '1 website',
      'SEO audit & recommendations',
      'AI Visibility Score tracking',
      '5 backlink opportunities/month',
      'Basic keyword extraction',
      'Email support',
    ],
    limits: {
      websites: 1,
      backlinksPerMonth: 5,
      contentPerMonth: 3,
    },
  },
  growth: {
    name: 'Growth',
    price: 79,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    features: [
      '3 websites',
      'Full backlink plans & drip scheduling',
      'Content generation (10/month)',
      'Reddit monitoring & suggested replies',
      'Citation Gap Analysis',
      'Fact Density analyzer',
      'Priority email support',
    ],
    limits: {
      websites: 3,
      backlinksPerMonth: 20,
      contentPerMonth: 10,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 149,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      '10 websites',
      'Everything in Growth',
      'LinkedIn lead finder',
      'Cold outreach draft generator',
      'Product Hunt launch prep',
      'Schema markup suggestions',
      'Dedicated account manager',
      'Priority support',
    ],
    limits: {
      websites: 10,
      backlinksPerMonth: 50,
      contentPerMonth: 30,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export default stripe;
