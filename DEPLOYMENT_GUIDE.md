# RankMind AI Deployment Guide

This guide will walk you through setting up the necessary services and deploying your application to Vercel.

## 1. Supabase Setup (Database & Auth)

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the left sidebar, go to **Project Settings** > **API**.
3. Copy the **Project URL** and **anon / public key**.
4. Go to **SQL Editor**, click **New query**, and paste the contents of `supabase/migrations/001_initial_schema.sql` and `supabase/migrations/002_add_subscription_fields.sql`. Run the query.
5. Go to **Authentication** > **URL Configuration**. Set the **Site URL** to `http://localhost:3000` for now. Add `http://localhost:3000/auth/callback` to the **Redirect URLs**.

## 2. Stripe Setup (Payments)

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Go to **Developers** > **API keys**. Copy the **Publishable key** and **Secret key**.
3. Go to **Products** and create three products:
   - **Starter**: $29/month
   - **Growth**: $79/month
   - **Enterprise**: $149/month
4. Copy the **API ID** (starts with `price_`) for each product.
5. Go to **Developers** > **Webhooks** and add an endpoint: `http://localhost:3000/api/stripe/webhook`. Select the events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
6. Copy the **Signing secret** (starts with `whsec_`).

## 3. Environment Variables

Create a `.env.local` file in the root of your project and fill in the values you copied:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

STRIPE_STARTER_PRICE_ID=your-starter-price-id
STRIPE_GROWTH_PRICE_ID=your-growth-price-id
STRIPE_ENTERPRISE_PRICE_ID=your-enterprise-price-id

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RankMind AI
```

## 4. Local Testing

1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the development server.
3. Open `http://localhost:3000` in your browser to test the application.

## 5. Vercel Deployment

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Add all the environment variables from your `.env.local` file.
4. Click **Deploy**.
5. Once deployed, update the **Site URL** and **Redirect URLs** in Supabase, and the **Webhook URL** in Stripe to your new Vercel domain.
