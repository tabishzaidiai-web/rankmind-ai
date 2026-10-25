import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free SEO Audit — Check Your Site in Seconds | RankMind AI',
  description:
    'Run a free 4-factor SEO audit on your website with no sign-up: meta title, meta description, H1 headings and page speed. RankBot scores 10 technical SEO factors in the full audit.',
  alternates: {
    canonical: 'https://www.rank-mind.com/free-audit',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/free-audit',
    title: 'Free SEO Audit — RankMind AI',
    description:
      'Run a free 4-factor SEO audit on your website with no sign-up: meta title, meta description, H1 headings and page speed.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function FreeAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
