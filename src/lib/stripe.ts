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
      '5 SEO audits/month',
      '50 keywords tracked',
      '4 articles/month',
      '5 backlink campaigns/month',
      'Weekly email reports',
      'Email support',
    ],
    limits: {
      websites: 1,
      auditsPerMonth: 5,
      keywordsTracked: 50,
      contentPerMonth: 4,
      backlinksPerMonth: 5,
    },
  },
  growth: {
    name: 'Growth',
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '3 websites',
      'Unlimited SEO audits',
      '500 keywords tracked',
      'Unlimited content generation',
      '20 backlink campaigns/month',
      'GEO visibility scoring',
      'Priority support',
    ],
    limits: {
      websites: 3,
      auditsPerMonth: -1,
      keywordsTracked: 500,
      contentPerMonth: -1,
      backlinksPerMonth: 20,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 149,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Unlimited websites',
      'Everything in Growth',
      'Unlimited keywords',
      'White-label PDF reports',
      'Multi-client management',
      'Agency dashboard',
      'Dedicated account manager',
    ],
    limits: {
      websites: -1,
      auditsPerMonth: -1,
      keywordsTracked: -1,
      contentPerMonth: -1,
      backlinksPerMonth: -1,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export default stripe;
