import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Centre — RankMind AI',
  description:
    'Help for RankMind AI: approval queue, outreach setup, GEO basics, billing, cancellation and refunds. Answers use only the published Terms, Refund Policy, Privacy Policy, Security page and homepage FAQ.',
  alternates: {
    canonical: 'https://www.rank-mind.com/help',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/help',
    title: 'Help Centre — RankMind AI',
    description:
      'Help for RankMind AI: approval queue, outreach setup, GEO basics, billing, cancellation and refunds.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function HelpPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">HELP CENTRE</p>
          <h1 className="text-4xl font-bold mb-6">Help Centre</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Short answers to the questions that come up most. Where an answer comes from a legal
            page, that page is linked so you can read the full wording. For anything else, email{' '}
            <a href="mailto:info@rank-mind.com" className="text-violet-400 hover:underline">info@rank-mind.com</a>{' '}
            for general support and billing, or{' '}
            <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a>{' '}
            for privacy requests.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Approval queue: what runs automatically, what needs you</h2>
          <p className="text-white/70 leading-relaxed">
            Audits, keyword tracking, reports, prospect research and drafts run automatically.
            Every outreach email, guest-post pitch and piece of content needs your approval
            before it is sent or published. Nothing is sent or published without your approval.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Outreach setup</h2>
          <p className="text-white/70 leading-relaxed">
            LinkBot finds relevant websites in your niche, drafts personalised outreach and
            tracks responses. You approve every pitch before anything is sent. LinkBot is
            included on the Growth plan and above; the free audit on its own does not include
            outreach.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">GEO basics</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            GEO (Generative Engine Optimization) means structuring and writing content so AI
            answer engines — ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot and
            Claude — can find, understand and cite it.
          </p>
          <p className="text-white/70 leading-relaxed">
            GEO-G prepares that content; it cannot guarantee that any engine will mention or
            cite your site. GEO optimisation is included on the Enterprise plan; audits and
            tracking run on every plan.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Billing</h2>
          <p className="text-white/70 leading-relaxed">
            Plans are billed monthly, in advance: Starter $29/month, Growth $79/month and
            Enterprise $149/month. Subscriptions automatically renew unless cancelled before
            the renewal date. Payments are processed securely by Stripe; RankMind AI does not
            store full card numbers.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Cancellation</h2>
          <p className="text-white/70 leading-relaxed">
            You may cancel at any time from your account Settings page or by contacting
            support. Cancellation stops future billing but does not automatically trigger a
            refund. Your access continues until the end of the current billing period, and
            downgrading your plan takes effect at the end of the current billing period.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Refunds</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            First-time subscribers may request a full refund of the initial subscription
            payment within 7 days of the initial charge, if they have not previously received
            a refund and their account is in good standing. Renewal charges after the initial
            7-day period and partial months of service after cancellation are not eligible.
            Approved refunds are processed within 5–10 business days to the original payment
            method.
          </p>
          <p className="text-white/70 leading-relaxed">
            Read the full wording on the{' '}
            <Link href="/refunds" className="text-violet-400 hover:underline">Refund Policy</Link>{' '}
            page, and the{' '}
            <Link href="/terms" className="text-violet-400 hover:underline">Terms of Service</Link>{' '}
            for cancellation and plan-change rules.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Privacy and security</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            RankMind AI uses TLS encryption in transit and AES-256 encryption at rest, and
            bcrypt password hashing. On account deletion, account data is deleted within
            30 days; billing records are retained for 7 years as required by financial
            regulations.
          </p>
          <p className="text-white/70 leading-relaxed">
            Privacy requests (access, correction or deletion) go to{' '}
            <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a>;
            the Privacy Policy states requests are answered within 30 days. Full details are on
            the{' '}
            <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>{' '}
            and{' '}
            <Link href="/security" className="text-violet-400 hover:underline">Security</Link>{' '}
            pages.
          </p>
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
