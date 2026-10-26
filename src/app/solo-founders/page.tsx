import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RankMind AI for Solo Founders',
  description:
    'For solo founders: a free 4-factor audit with no sign-up, a full 10-factor audit on a free account, and weekly reports — no agency retainer.',
  alternates: {
    canonical: 'https://www.rank-mind.com/solo-founders',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/solo-founders',
    title: 'RankMind AI for Solo Founders',
    description:
      'For solo founders: a free 4-factor audit with no sign-up, a full 10-factor audit on a free account, and weekly reports — no agency retainer.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function SoloFoundersPage() {
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
          <h1 className="text-4xl font-bold mb-6">RankMind AI for solo founders</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Run weekly SEO and AI-visibility work on your own website without an agency retainer —
            with every outreach pitch approved by you first.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Start free, before you pay anything</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Run the free 4-factor audit on your own site with no sign-up. It checks meta title,
            meta description, H1 heading and page speed.
          </p>
          <p className="text-white/70 leading-relaxed">
            A free account gives the full 10-factor RankBot audit. RankBot scores 10 technical SEO
            factors and gives a prioritised action plan in plain language.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">What you get each week</h2>
          <p className="text-white/70 leading-relaxed">
            Weekly reports show audits run, prospects contacted, replies received, content drafted
            and links earned — with dates. Audits, keyword tracking, reports, prospect research and
            drafts run automatically; every outreach email, guest-post pitch and piece of content
            needs your approval before it is sent or published.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">What it costs</h2>
          <p className="text-white/70 leading-relaxed">
            Starter is $29/month, billed monthly, for 1 website with keyword tracking (up to 20),
            the full 10-factor audit and weekly automated reports. Growth is $79/month and
            Enterprise is $149/month. First-time subscribers have a 7-day money-back guarantee.
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
