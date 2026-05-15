import type { Metadata } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rankmind-ai.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'RankMind AI — Autonomous SEO & GEO Agents That Rank Your Website',
    template: '%s | RankMind AI',
  },
  description: 'RankMind AI deploys autonomous AI agents that build real backlinks, optimize for ChatGPT & Perplexity AI search, write SEO content, and get your website to page 1 — automatically.',
  keywords: ['SEO automation', 'AI SEO', 'backlink builder', 'GEO optimization', 'AI search optimization', 'ChatGPT SEO', 'Perplexity SEO', 'automated SEO', 'SEO agent'],
  authors: [{ name: 'RankMind AI' }],
  creator: 'RankMind AI',
  publisher: 'RankMind AI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'RankMind AI',
    title: 'RankMind AI — Autonomous SEO & GEO Agents That Rank Your Website',
    description: 'Deploy AI agents that build real backlinks, optimize for AI search engines, write SEO content, and rank your website — 100% automated.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RankMind AI — Autonomous SEO Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RankMind AI — Autonomous SEO & GEO Agents',
    description: 'Deploy AI agents that build real backlinks, optimize for AI search, and rank your website automatically.',
    images: ['/og-image.png'],
    creator: '@rankmindai',
  },
  icons: {
    icon: [
      { url: '/logo-icon-v2.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-icon-v2.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo-icon-v2.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
