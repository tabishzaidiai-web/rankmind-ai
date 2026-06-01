import type { NextConfig } from 'next';

const SITE_URL = 'https://www.rank-mind.com';

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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://www.rank-mind.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://google.serper.dev https://vitals.vercel-insights.com https://vercel.live",
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
