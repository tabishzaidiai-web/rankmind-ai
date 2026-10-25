import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact RankMind AI for support, billing questions or privacy requests. General support: info@rank-mind.com. Privacy requests: privacy@rankmind.ai.',
  alternates: {
    canonical: 'https://www.rank-mind.com/contact',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/contact',
    title: 'Contact Us',
    description:
      'Contact RankMind AI for support, billing questions or privacy requests.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">CONTACT</p>
          <h1 className="text-4xl font-bold mb-6">Contact RankMind AI</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Email is the fastest way to reach us. Please include your website URL and plan
            so we can help without extra back-and-forth.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-2">General support and billing</h2>
            <a href="mailto:info@rank-mind.com" className="text-violet-400 hover:underline">info@rank-mind.com</a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-2">Privacy requests</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-2">
              Access, correction or deletion requests, as described in the Privacy Policy.
            </p>
            <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-2">Refund requests</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              See the <Link href="/refunds" className="text-violet-400 hover:underline">Refund Policy</Link> for
              the 7-day money-back guarantee for first-time subscribers.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Before you write</h2>
          <p className="text-white/60 leading-relaxed">
            Running the <Link href="/free-audit" className="text-violet-400 hover:underline">free 4-factor audit</Link> on
            your own site takes seconds and needs no sign-up. RankMind AI is researched and developed by Arabian AI Lab,
            Dubai, and marketed and operated by Jeem &amp; Co FZE LLC, Dubai, UAE.
          </p>
        </section>
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm mt-8">
        <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
        <span className="mx-3">·</span>
        <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
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
