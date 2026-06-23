import type { Metadata } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rank-mind.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'RankMind AI — Autonomous SEO & GEO Agents That Rank Your Website',
    template: '%s | RankMind AI',
  },
  description: 'RankMind AI deploys autonomous AI agents that build real backlinks, optimize for ChatGPT & Perplexity AI search, write SEO content, and get your website to page 1 — automatically.',
  keywords: ['SEO automation', 'AI SEO', 'backlink builder', 'GEO optimization', 'AI search optimization', 'ChatGPT SEO', 'Perplexity SEO', 'automated SEO', 'SEO agent', 'rank-mind', 'rankmind'],
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
    canonical: '/',
  },
};

// Schema.org structured data
const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#software`,
      name: 'RankMind AI',
      url: BASE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Autonomous SEO and GEO platform that deploys AI agents to rank websites on Google, ChatGPT, Perplexity, and every major AI search engine — automatically.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '5.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '15.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Enterprise',
          price: '49.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
      ],
      creator: {
        '@type': 'Organization',
        name: 'Arabian AI Lab',
        url: 'https://arabianailab.com',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Jeem & Co FZE LLC',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo-icon-v2.png`,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@rank-mind.com',
        contactType: 'customer support',
      },
      sameAs: [
        'https://x.com/rankmindai',
        'https://linkedin.com/company/rankmindai',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${BASE_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is RankMind AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'RankMind AI is an autonomous SEO and GEO platform that deploys AI agents to rank your website on Google, ChatGPT, Perplexity, and every major AI search engine — automatically.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need technical knowledge to use RankMind AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. RankMind AI is designed for non-technical founders and marketers. You enter your website URL and the AI agents handle everything — audits, backlinks, content, and GEO optimization.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is GEO optimization?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GEO (Generative Engine Optimization) is the practice of optimizing your website to appear in AI-generated answers from ChatGPT, Perplexity, Google AI Overviews, and other AI search engines.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does RankMind AI cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'RankMind AI starts at $5/month (Starter), $15/month (Growth), and $49/month (Enterprise). All plans include a free tier with 10 audits per month.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a free trial?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can run a free teaser audit at rank-mind.com/free-audit without creating an account. Free accounts also get 10 SEO audits per month.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
