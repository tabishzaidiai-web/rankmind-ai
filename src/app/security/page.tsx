import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security & Data — RankMind AI',
  description:
    'How RankMind AI protects your data: TLS encryption in transit, AES-256 encryption at rest, bcrypt password hashing, Stripe payment processing with no full card numbers stored, and account deletion within 30 days.',
  alternates: {
    canonical: 'https://www.rank-mind.com/security',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/security',
    title: 'Security & Data — RankMind AI',
    description:
      'How RankMind AI protects your data: TLS in transit, AES-256 at rest, bcrypt password hashing, and Stripe payments with no full card numbers stored.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

const providers = [
  { name: 'Supabase', use: 'Authentication & database', location: 'USA (AWS)' },
  { name: 'Stripe', use: 'Payment processing', location: 'USA' },
  { name: 'OpenAI', use: 'AI content generation', location: 'USA' },
  { name: 'Resend', use: 'Transactional email delivery', location: 'USA' },
  { name: 'Vercel', use: 'Hosting & infrastructure', location: 'USA / Global CDN' },
  { name: 'Google', use: 'OAuth login, Search API', location: 'USA / Global' },
];

export default function SecurityPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">SECURITY & DATA</p>
          <h1 className="text-4xl font-bold mb-6">Security &amp; Data</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            This page states what RankMind AI does to protect your data, in the same terms
            as the Privacy Policy. It makes no certification claim beyond what is stated here.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-6">How your data is protected</h2>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">Encryption</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                TLS encryption in transit and AES-256 encryption at rest.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">Passwords</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Passwords are hashed with bcrypt. We do not store passwords in readable form.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">Payments</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Payments are processed securely by Stripe. We do not store full card numbers.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">Your approval gate</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                AI-generated outputs may not always be accurate, complete or suitable for your
                needs. You review outreach pitches and content before anything is sent or
                published, and you are responsible for reviewing, editing and publishing
                AI-generated content.
              </p>
            </div>
          </div>
          <p className="text-white/40 text-sm mt-6 leading-relaxed">
            No method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-6">Who processes your data</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            {providers.map((p) => (
              <div key={p.name} className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                <span className="text-white font-medium sm:w-28 flex-shrink-0">{p.name}</span>
                <span className="text-white/60">{p.use}</span>
                <span className="text-white/40 sm:ml-auto">{p.location}</span>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-6 leading-relaxed">
            Full detail is in the <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-6">Deletion and retention</h2>
          <ul className="text-white/60 leading-relaxed space-y-2 list-disc pl-5">
            <li>On account deletion, account data is deleted within 30 days.</li>
            <li>Billing records are retained for 7 years as required by financial regulations.</li>
            <li>Privacy requests: <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a> — we respond within 30 days.</li>
          </ul>
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
