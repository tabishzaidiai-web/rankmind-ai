import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What is GEO? Generative Engine Optimization',
  description:
    'GEO means structuring content so AI answer engines can find, understand and cite it. GEO-G prepares that content on the Enterprise plan.',
  alternates: {
    canonical: 'https://www.rank-mind.com/geo',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/geo',
    title: 'What is GEO? — RankMind AI',
    description:
      'GEO means structuring content so AI answer engines can find, understand and cite it. GEO-G prepares that content on the Enterprise plan.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function GeoPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">GEO</p>
          <h1 className="text-4xl font-bold mb-6">What is GEO?</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            GEO (Generative Engine Optimization) means structuring and writing content so AI answer engines —
            ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot and Claude — can find, understand and cite it.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">What GEO-G does</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            GEO-G, RankMind AI&apos;s GEO agent, prepares content for ChatGPT, Perplexity, Google AI Overviews,
            Gemini, Copilot and Claude. You approve content before it is published.
          </p>
          <p className="text-white/70 leading-relaxed">
            GEO optimisation is included on the Enterprise plan; audits and tracking run on every plan.
            Enterprise is $149/month, billed monthly.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">What GEO-G cannot guarantee</h2>
          <p className="text-white/70 leading-relaxed">
            GEO-G prepares content; it cannot guarantee that any engine will mention or cite your site.
            Rankings and backlinks depend on your site, your niche, third-party publishers and search engines,
            and are not guaranteed.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Who it is for</h2>
          <p className="text-white/70 leading-relaxed">
            GEO-G is for site owners who want their content prepared for AI-generated answers as well as
            traditional search results, without anything being published before they approve it.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Start with the free audit</h2>
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
