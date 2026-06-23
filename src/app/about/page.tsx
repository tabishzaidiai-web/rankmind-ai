import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About RankMind AI — Arabian AI Lab',
  description: 'RankMind AI is an autonomous SEO and GEO platform researched by Arabian AI Lab and operated by Jeem & Co FZE LLC, Dubai, UAE. Meet the founder and learn our mission.',
  alternates: {
    canonical: 'https://www.rank-mind.com/about',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/about',
    title: 'About RankMind AI — Arabian AI Lab',
    description: 'RankMind AI is an autonomous SEO and GEO platform researched by Arabian AI Lab and operated by Jeem & Co FZE LLC, Dubai, UAE.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

const beliefs = [
  {
    icon: '🤖',
    title: 'AI should do the work, not just advise',
    body: 'Most SEO tools give you a list of recommendations and leave you to do the work. RankMind AI executes — it builds backlinks, writes content, and optimizes your GEO presence autonomously.',
  },
  {
    icon: '🌍',
    title: 'Great SEO should be accessible to everyone',
    body: 'Enterprise-grade SEO has always been locked behind expensive agencies and complex tools. We built RankMind AI so that a solo founder in Dubai can compete with a Fortune 500 marketing team.',
  },
  {
    icon: '🔍',
    title: 'The future of search is AI-generated answers',
    body: 'Google is no longer the only search engine that matters. ChatGPT, Perplexity, and Gemini are answering millions of queries daily. GEO optimization is not optional — it is the next frontier.',
  },
  {
    icon: '⚡',
    title: 'Speed compounds',
    body: 'Every week you delay SEO is a week your competitors gain ground. Autonomous agents that work 24/7 compound your ranking advantage faster than any human team can match.',
  },
];

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

        {/* Section 2 — What We Believe */}
        <section className="border-t border-white/10 pt-16">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">WHAT WE BELIEVE</p>
          <h2 className="text-3xl font-bold mb-10">Our Core Beliefs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {beliefs.map((b) => (
              <div
                key={b.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 hover:bg-white/[0.07] transition-all"
              >
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — The Research */}
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
            <a
              href="https://linkedin.com/in/tabish-babar-syed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 rounded-lg text-sm font-medium transition-colors"
              aria-label="Tabish on LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a
              href="https://x.com/tabishzaidi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 rounded-lg text-sm font-medium transition-colors"
              aria-label="Tabish on X"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
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
              <a href="mailto:info@rank-mind.com" className="text-violet-400 hover:underline">info@rank-mind.com</a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-white/10 pt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to rank your website?</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Join hundreds of founders using RankMind AI to automate their SEO and appear in AI search results — no agency required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all text-lg"
            >
              Start Free — No Card Required
            </Link>
            <Link
              href="/free-audit"
              className="px-8 py-4 bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/10 text-white font-semibold rounded-xl transition-all text-lg"
            >
              Get Free SEO Score →
            </Link>
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
