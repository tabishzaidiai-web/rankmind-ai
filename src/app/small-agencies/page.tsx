import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RankMind AI for Small Agencies',
  description:
    'For small agencies: run RankBot, LinkBot, GEO-G and ContentAI across 5 websites on Growth or unlimited websites on Enterprise, with approval first.',
  alternates: {
    canonical: 'https://www.rank-mind.com/small-agencies',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/small-agencies',
    title: 'RankMind AI for Small Agencies',
    description:
      'For small agencies: run RankBot, LinkBot, GEO-G and ContentAI across 5 websites on Growth or unlimited websites on Enterprise, with approval first.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function SmallAgenciesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon-v2.png" alt="RankMind AI" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white">RankMind AI</span>
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← Back to Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        <section>
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">USE CASE</p>
          <h1 className="text-4xl font-bold mb-6">RankMind AI for small agencies</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Run weekly SEO and AI-visibility work across more than one website, with approval
            before every outreach pitch and every publish.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">More than one website</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Growth is $79/month, billed monthly, for 5 websites, with LinkBot backlink prospecting
            and personalised outreach campaigns — you approve every pitch — plus Google Sheets tracking.
          </p>
          <p className="text-white/70 leading-relaxed">
            Enterprise is $149/month, billed monthly, for unlimited websites, with the GEO Optimizer
            Agent (GEO-G), the AI Content Writer Agent (ContentAI), custom agent instructions and
            priority support.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Approval before anything external</h2>
          <p className="text-white/70 leading-relaxed">
            Audits, keyword tracking, reports, prospect research and drafts run automatically.
            Every outreach email, guest-post pitch and piece of content needs approval before it
            is sent or published. Weekly reports show audits run, prospects contacted, replies
            received, content drafted and links earned — with dates.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Start with the free audit</h2>
          <p className="text-white/70 leading-relaxed">
            Run the free 4-factor audit on any site with no sign-up: meta title, meta description,
            H1 heading and page speed. A free account gives the full 10-factor RankBot audit.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Try it free first</h2>
          <p className="text-white/60 mb-8">
            Run the free 4-factor audit on your own site with no sign-up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free-audit"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all"
            >
              Get Free SEO Score →
            </Link>
            <Link
              href="/#pricing"
              className="px-8 py-4 bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
            >
              See Pricing
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm mt-8">
        <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
        <span className="mx-3">·</span>
        <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        <span className="mx-3">·</span>
        <Link href="/" className="hover:text-white/60 transition-colors">RankMind AI</Link>
      </footer>
    </div>
  );
}
