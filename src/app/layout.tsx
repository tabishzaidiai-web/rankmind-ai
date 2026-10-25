import type { Metadata } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rank-mind.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'RankMind AI — AI SEO & GEO Agents for Small Business',
    template: '%s | RankMind AI',
  },
  description: 'RankBot audits 10 factors, LinkBot finds outreach prospects, GEO-G prepares content for AI search, ContentAI drafts SEO content. Free audit, no sign-up.',
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
    title: 'RankMind AI — AI SEO & GEO Agents for Small Business',
    description: 'AI agents that audit, fix and grow your search and AI visibility. Free audit, no sign-up. You approve every pitch.',
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
    description: 'AI agents that audit, fix and grow your search and AI visibility. Free audit, no sign-up. You approve every pitch.',
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
        'SEO and GEO platform with four AI agents. You approve every outreach pitch and every publish.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '29.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '79.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
        },
        {
          '@type': 'Offer',
          name: 'Enterprise',
          price: '149.00',
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
        'https://linkedin.com/company/rankmind-ai',
      ],
    },
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/#founder`,
      name: 'Tabish Zaidi',
      jobTitle: 'Founder, Arabian AI Lab',
      url: 'https://tabishzaidi.com',
      worksFor: {
        '@type': 'Organization',
        name: 'Arabian AI Lab',
        url: 'https://arabianailab.com',
      },
      sameAs: [
        'https://linkedin.com/in/syed-tabish-41668a',
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
