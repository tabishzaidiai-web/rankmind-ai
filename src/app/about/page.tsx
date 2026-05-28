import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About RankMind AI — Arabian AI Lab',
  description: 'RankMind AI is researched and developed by Arabian AI Lab and marketed by Jeem & Co FZE LLC, Dubai, UAE.',
  alternates: {
    canonical: 'https://www.rank-mind.com/about',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/about',
    title: 'About RankMind AI — Arabian AI Lab',
    description: 'RankMind AI is researched and developed by Arabian AI Lab and marketed by Jeem & Co FZE LLC, Dubai, UAE.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon-v2.png" alt="RankMind AI" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white">RankMind AI</span>
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← Back to Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">

        {/* Section 1 — The Product */}
        <section>
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">THE PRODUCT</p>
          <h1 className="text-4xl font-bold mb-6">About RankMind AI</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            RankMind AI is an autonomous SEO and GEO platform that deploys AI agents to rank your website on Google,
            ChatGPT, Perplexity, and every major AI search engine — automatically. From technical audits and backlink
            building to AI-optimized content and schema generation, RankMind AI handles the full SEO stack so you can
            focus on growing your business.
          </p>
        </section>

        {/* Section 2 — The Research */}
        <section className="border-t border-white/10 pt-16">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">THE RESEARCH</p>
          <h2 className="text-3xl font-bold mb-6">Researched &amp; Developed by Arabian AI Lab</h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Arabian AI Lab is a UAE-based human-centered AI innovation studio building practical AI solutions for
            businesses across the Arab world and beyond. The lab focuses on making enterprise-grade AI accessible,
            transparent, and genuinely useful — not just technically impressive.
          </p>
          <a
            href="https://arabianailab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Visit Arabian AI Lab →
          </a>
        </section>

        {/* Section 3 — The Founder */}
        <section className="border-t border-white/10 pt-16">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">THE FOUNDER</p>
          <h2 className="text-3xl font-bold mb-2">TABISH BABAR</h2>
          <p className="text-sm text-white/50 mb-6 tracking-widest uppercase">
            Founder, Arabian AI Lab &nbsp;&middot;&nbsp; Digital Architect &nbsp;&middot;&nbsp; Dubai, UAE
          </p>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            A pioneer in the practical application of AI, bridging the speed of Silicon Valley with the luxury
            craftsmanship of Dubai. Making knowledge borderless and opportunity limitless.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="https://arabianailab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Arabian AI Lab →
            </a>
            <a
              href="https://tabishzaidi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-violet-500 text-violet-400 hover:bg-violet-500/10 rounded-lg text-sm font-medium transition-colors"
            >
              tabishzaidi.com →
            </a>
          </div>
        </section>

        {/* Section 4 — The Company */}
        <section className="border-t border-white/10 pt-16">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">THE COMPANY</p>
          <h2 className="text-3xl font-bold mb-6">Marketed &amp; Operated by Jeem &amp; Co FZE LLC</h2>
          <p className="text-white/70 text-lg leading-relaxed mb-6">
            RankMind AI is commercially operated by Jeem &amp; Co FZE LLC, a registered company in Dubai, UAE.
            All payments and billing are processed under Jeem &amp; Co FZE LLC. The charge on your bank statement
            will appear as <strong className="text-white">&ldquo;JEEM AND CO FZE LLC&rdquo;</strong>.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-sm text-white/60 space-y-2">
            <div><span className="text-white/40">Company:</span> Jeem &amp; Co FZE LLC</div>
            <div><span className="text-white/40">Location:</span> Dubai, UAE</div>
            <div>
              <span className="text-white/40">Support:</span>{' '}
              <a href="mailto:support@rankmind.ai" className="text-violet-400 hover:underline">support@rankmind.ai</a>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
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
