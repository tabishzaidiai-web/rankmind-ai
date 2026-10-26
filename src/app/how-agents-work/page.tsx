import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How the Agents Work',
  description:
    'How RankMind AI agents work: RankBot audits 10 factors, LinkBot finds prospects and drafts outreach, GEO-G prepares AI-search content, ContentAI drafts it.',
  alternates: {
    canonical: 'https://www.rank-mind.com/how-agents-work',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/how-agents-work',
    title: 'How the Agents Work',
    description:
      'RankBot, LinkBot, GEO-G and ContentAI: what each agent does, and what you approve before anything is sent or published.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

const agents = [
  {
    name: 'RankBot',
    role: 'SEO Audit Agent',
    plan: 'Starter',
    does: 'Crawls your website, scores 10 technical SEO factors, finds quick wins and creates a prioritised action plan in plain language.',
    youApprove: 'No approval needed to run an audit — an audit only reads and reports.',
  },
  {
    name: 'LinkBot',
    role: 'Backlink Builder',
    plan: 'Growth',
    does: 'Finds relevant websites in your niche, drafts personalised outreach and tracks responses.',
    youApprove: 'You approve every outreach pitch before anything is sent.',
  },
  {
    name: 'GEO-G',
    role: 'GEO Optimizer',
    plan: 'Enterprise',
    does: 'Prepares content to appear in AI-generated answers from ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot and Claude.',
    youApprove: 'You approve content before it is published.',
  },
  {
    name: 'ContentAI',
    role: 'Content Writer',
    plan: 'Enterprise',
    does: 'Drafts SEO blog posts, landing pages and meta content.',
    youApprove: 'You approve every draft before it is published.',
  },
];

export default function HowAgentsWorkPage() {
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
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">HOW IT WORKS</p>
          <h1 className="text-4xl font-bold mb-6">How the agents work</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Four agents do the weekly work. The rule for all of them is the same:
            nothing is sent or published without your approval.
          </p>
        </section>

        <section className="border-t border-white/10 pt-12 space-y-6">
          {agents.map((a) => (
            <div key={a.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
                <h2 className="text-xl font-bold text-white">{a.name}</h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">{a.plan}</span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-3">{a.role}</p>
              <p className="text-white/70 leading-relaxed mb-3">{a.does}</p>
              <p className="text-white/60 text-sm leading-relaxed">
                <span className="text-white/40">Your approval: </span>{a.youApprove}
              </p>
            </div>
          ))}
        </section>

        <section className="border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">What you see each week</h2>
          <p className="text-white/60 leading-relaxed">
            Weekly reports show audits run, prospects contacted, replies received, content
            drafted and links earned — with dates. Plans are billed monthly, and first-time
            subscribers have a 7-day money-back guarantee.
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
