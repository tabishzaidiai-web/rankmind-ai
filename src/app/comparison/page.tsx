import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RankMind AI vs Semrush — October 2026 Comparison',
  description:
    'Dated October 2026 comparison of RankMind AI with Semrush. RankMind facts come from rank-mind.com; unverified cells say Not stated.',
  alternates: {
    canonical: 'https://www.rank-mind.com/comparison',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/comparison',
    title: 'RankMind AI vs Semrush — October 2026',
    description:
      'Dated October 2026 comparison of RankMind AI with Semrush. RankMind facts come from rank-mind.com; unverified cells say Not stated.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

const NOT_STATED = 'Not stated — not verified on the vendor\u2019s site for this page';

export default function ComparisonPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">COMPARISON · OCTOBER 2026</p>
          <h1 className="text-4xl font-bold mb-6">RankMind AI vs Semrush</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            A dated, factual comparison. RankMind AI cells come from rank-mind.com pages.
            Every Semrush cell that could not be verified on the vendor&apos;s site for this page
            says &ldquo;Not stated&rdquo; instead of a guessed price, feature or rating.
            No outcome, ranking or review score is claimed for either product here.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-4 text-white/50 font-medium">Question</th>
                  <th className="text-left py-3 pr-4 text-white font-medium">RankMind AI</th>
                  <th className="text-left py-3 text-white font-medium">Semrush</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-4 text-white/60">Entry price</td>
                  <td className="py-3 pr-4 text-white">$29/month, Starter, billed monthly</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-white/60">What the free entry includes</td>
                  <td className="py-3 pr-4 text-white">Free 4-factor audit (meta title, meta description, H1 heading, page speed); a free account gives the full 10-factor audit</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-white/60">Does the free audit need sign-up?</td>
                  <td className="py-3 pr-4 text-white">No sign-up required</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-white/60">Does outreach or content send without approval?</td>
                  <td className="py-3 pr-4 text-white">No — you approve every outreach pitch and every publish before anything is sent or published</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-white/60">Is GEO optimisation included, or separate?</td>
                  <td className="py-3 pr-4 text-white">GEO-G is included on the Enterprise plan ($149/month); it is not included in the Starter or Growth plans as stated on this site</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-white/60">Websites on the entry plan</td>
                  <td className="py-3 pr-4 text-white">1 website (Starter)</td>
                  <td className="py-3 text-white/60">{NOT_STATED}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-white/40 text-xs mt-6">
            Method note: Semrush cells are marked Not stated because no vendor page was verified
            for this page. Search-result price or feature observations were deliberately not used.
            This page will only gain Semrush figures when they are checked on the vendor&apos;s site.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Which fits whom?</h2>
          <p className="text-white/70 leading-relaxed">
            Choose RankMind AI if you want agents that do the work but never send anything
            without your approval. Choose an all-in-one suite if a large keyword and backlink
            database matters more to you than approval gating. This page does not claim that
            either product is better overall.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Try RankMind AI free first</h2>
          <p className="text-white/60 mb-8">
            Run the free 4-factor audit on your own site with no sign-up.
          </p>
          <Link
            href="/free-audit"
            className="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all"
          >
            Get Free SEO Score →
          </Link>
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
