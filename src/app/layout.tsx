import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RankMind AI - Real SEO & GEO Automation',
  description: 'AI-powered SEO and GEO optimization platform. Real backlinks, real rankings, real results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
