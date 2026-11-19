import type { NextConfig } from 'next';

const SITE_URL = 'https://www.rank-mind.com';

// GA4: NEXT_PUBLIC_GA_ID is baked into the JavaScript at BUILD time. If it is
// missing in Vercel's Production environment, analytics silently never loads
// (the banner still shows and Accept still works). Fail production builds
// loudly instead, so a build without a valid ID can never go live.
// Previews and local builds are not affected.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';
if (process.env.VERCEL_ENV === 'production' && !/^G-[A-Z0-9]+$/.test(GA_ID)) {
  throw new Error(
    `NEXT_PUBLIC_GA_ID is ${GA_ID ? `invalid ("${GA_ID}")` : 'missing'} in Vercel's Production environment. ` +
      'Set it to the RankMind GA4 measurement ID (G-DBWB1BDS2S) under Project → Settings → Environment Variables, then redeploy.'
  );
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── Redirects ───────────────────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/#pricing',
        permanent: false,
      },
    ];
  },

  // ── HTTP Security Headers + CORS ────────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://www.rank-mind.com https://www.googletagmanager.com https://*.google-analytics.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://youtube.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://google.serper.dev https://vitals.vercel-insights.com https://vercel.live https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // CORS for API routes — allow only the production domain
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: SITE_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
        ],
      },
    ];
  },
};

export default nextConfig;
