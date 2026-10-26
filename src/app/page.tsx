'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AgentDemo from '@/components/AgentDemo';
import RankEverywhere from '@/components/RankEverywhere';
import ProductScreenshots from '@/components/ProductScreenshots';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Zap, ChevronDown, MessageCircle } from 'lucide-react';

const AGENTS = [
  {
    avatar: '/agent-rankbot-transparent.png',
    name: 'RankBot',
    title: 'SEO Audit Agent',
    description: 'Deep crawls your website, scores 10 key SEO factors, finds quick wins, and creates a prioritized action plan.',
    href: '/signup',
    glow: 'rgba(139,92,246,0.4)',
    border: 'border-violet-500/40',
    bg: 'from-violet-500/10 to-purple-900/10',
    badge: 'bg-violet-500/20 text-violet-300',
    tier: 'Starter',
    color: '#7c3aed',
    planKey: 'starter',
  },
  {
    avatar: '/agent-linkbot-transparent.png',
    name: 'LinkBot',
    title: 'Backlink Builder',
    description: 'Finds relevant websites in your niche, drafts personalised outreach, and tracks responses. You approve every pitch.',
    href: '/signup',
    glow: 'rgba(20,184,166,0.4)',
    border: 'border-teal-500/40',
    bg: 'from-teal-500/10 to-cyan-900/10',
    badge: 'bg-teal-500/20 text-teal-300',
    tier: 'Growth',
    color: '#0d9488',
    planKey: 'growth',
  },
  {
    avatar: '/agent-geog-transparent.png',
    name: 'GEO-G',
    title: 'GEO Optimizer',
    description: 'Optimizes your content to appear in ChatGPT, Perplexity, Google AI Overviews, and other AI search engines.',
    href: '/signup',
    glow: 'rgba(59,130,246,0.4)',
    border: 'border-blue-500/40',
    bg: 'from-blue-500/10 to-indigo-900/10',
    badge: 'bg-blue-500/20 text-blue-300',
    tier: 'Enterprise',
    color: '#2563eb',
    planKey: 'enterprise',
  },
  {
    avatar: '/agent-contentai-transparent.png',
    name: 'ContentAI',
    title: 'Content Writer',
    description: 'Drafts SEO blog posts, landing pages, and meta content for your review before publishing.',
    href: '/signup',
    glow: 'rgba(245,158,11,0.4)',
    border: 'border-amber-500/40',
    bg: 'from-amber-500/10 to-orange-900/10',
    badge: 'bg-amber-500/20 text-amber-300',
    tier: 'Enterprise',
    color: '#d97706',
    planKey: 'enterprise',
  },
];

const FAQS = [
  { q: 'What is RankMind AI?', a: 'RankMind AI is an SEO and GEO (Generative Engine Optimization) platform. Four AI agents — RankBot, LinkBot, GEO-G and ContentAI — audit your website, find relevant backlink prospects, prepare content for AI search engines, and draft SEO content. You approve every outreach pitch and every publish.' },
  { q: 'Do I need technical knowledge to use RankMind AI?', a: 'No. Enter your website URL and target keywords. RankBot scores 10 technical SEO factors and gives a prioritised action plan in plain language. You approve outreach pitches and content before anything is sent or published.' },
  { q: 'What is GEO optimisation?', a: 'GEO (Generative Engine Optimization) means structuring and writing content so AI answer engines — ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot and Claude — can find, understand and cite it. GEO-G prepares that content; it cannot guarantee that any engine will mention or cite your site.' },
  { q: 'What does the free audit check?', a: 'The free audit at rank-mind.com/free-audit checks 4 factors with no sign-up: meta title, meta description, H1 heading, and page speed. A free account gives the full 10-factor RankBot audit.' },
  { q: 'How much does RankMind AI cost?', a: 'Starter is $29/month, Growth is $79/month, and Enterprise is $149/month. Plans are billed monthly, can be cancelled anytime, and first-time subscribers have a 7-day money-back guarantee.' },
  { q: 'Is there a free trial?', a: 'There is a free 4-factor audit with no sign-up. There is no separate time-limited free trial.' },
  { q: 'Do you guarantee rankings or a number of backlinks?', a: 'No. We report audits run, prospects found, pitches you approved, replies tracked, and weekly activity. Rankings and backlinks depend on your site, your niche, third-party publishers and search engines, and are not guaranteed.' },
  { q: 'What do I approve, and what runs automatically?', a: 'Audits, keyword tracking, reports, prospect research and drafts run automatically. Every outreach email, guest-post pitch and piece of content needs your approval before it is sent or published.' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollFade();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function PricingButton({ planKey, cta, className }: { planKey: string; cta: string; className: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      window.location.href = `/api/stripe/checkout?plan=${planKey}`;
    } catch {
      setLoading(false);
      window.location.href = `/signup?plan=${planKey}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${className} disabled:opacity-70 disabled:cursor-wait`}
    >
      {loading ? 'Loading...' : cta}
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Section 1 — hero URL form state
  const [heroUrl, setHeroUrl] = useState('');
  // Section 8 — billing toggle state

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section 1 — hero form submit handler
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroUrl.trim();
    if (!trimmed) return;
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    router.push(`/free-audit?url=${encodeURIComponent(url)}`);
  };

  // Section 8 — pricing with annual toggle
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      planKey: 'starter',
      desc: 'Perfect for individual websites',
      features: ['Full SEO Audit (10 key factors)', 'Weekly automated reports', 'Keyword tracking (up to 20)', 'Email support', '1 website'],
      cta: 'Start Ranking Free',
      popular: false,
    },
    {
      name: 'Growth',
      price: '$79',
      planKey: 'growth',
      desc: 'For agencies and growing businesses',
      features: ['Everything in Starter', 'LinkBot backlink prospecting', 'Personalised outreach campaigns — you approve every pitch', 'Outreach automation', 'Google Sheets tracking', '5 websites'],
      cta: 'Start Building Backlinks',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$149',
      planKey: 'enterprise',
      desc: 'Full SEO machine for agencies',
      features: ['Everything in Growth', 'GEO Optimizer Agent', 'AI Content Writer Agent', 'ChatGPT/Perplexity visibility', 'Custom agent instructions', 'Unlimited websites', 'Priority support'],
      cta: 'Get the Full SEO Stack',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float2 { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes float3 { 0%,100%{transform:translateY(-3px)} 50%{transform:translateY(9px)} }
        @keyframes float4 { 0%,100%{transform:translateY(4px)} 50%{transform:translateY(-8px)} }
        .agent-card .agent-cta { opacity:0; transform:translateY(6px); transition:all 0.2s; }
        .agent-card:hover .agent-cta { opacity:1; transform:translateY(0); }
        .agent-card { transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .agent-card:hover { transform:translateY(-6px); }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Sticky Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon-v2.png" alt="RankMind AI" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl">RankMind AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hidden md:block bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
              Get Started Free
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="md:hidden flex items-center justify-center w-11 h-11 text-white/70 hover:text-white transition-colors text-xl"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col gap-4 z-50">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white text-base font-medium transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white text-sm transition-colors">Sign In</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            <Zap className="w-4 h-4" />
            Real AI Agents. Real SEO Results.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            AI agents that audit, fix and grow your search and AI visibility — every week.
          </h1>
          {/* Section 3 — "your clients" → "your website" */}
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            RankBot audits your site, LinkBot finds relevant outreach prospects, GEO-G prepares content for ChatGPT,
            Perplexity, Google AI Overviews, Gemini, Copilot and Claude, and ContentAI drafts SEO content.
            You approve every pitch and every publish. Weekly reports show exactly what was done.
          </p>

          {/* Section 1 — Inline URL audit form (replaces agent avatar links) */}
          <form
            onSubmit={handleHeroSubmit}
            className="w-full max-w-xl mx-auto mb-4"
          >
            <label htmlFor="hero-url-input" className="sr-only">Enter your website for a free SEO audit</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="hero-url-input"
                type="url"
                name="url"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="Enter your website URL — e.g. https://yoursite.com"
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all w-full"
                style={{ fontSize: '16px' }}
                autoComplete="url"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
              >
                Get My Free SEO Score →
              </button>
            </div>
          </form>
          <p className="text-sm text-white/30">No credit card required. Free SEO audit included.</p>
          <p className="text-sm text-white/40 mt-2">Free 4-factor audit, no sign-up. Full 10-factor audit when you create a free account. You approve every outreach pitch.</p>

          {/* Live Demo — working inline demo, no signup required */}
          <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                🔍 Live Demo — No signup required
              </span>
            </div>
            <AgentDemo />
          </div>
        </div>
      </section>

      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/70 text-lg">See it on a real site — including ours.</p>
          <p className="text-white/45 text-sm mt-2">Run the free audit on your own site with no sign-up. We publish no customer testimonials or performance statistics without permission and evidence.</p>
        </div>
      </section>

      {/* Agent Cards — Section 2: href → /signup, text → Try Free */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Your AI Agents</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Four AI agents working every week on your search and AI visibility.
              </p>
            </div>
          </FadeSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENTS.map((agent, i) => {
              const anims = ['float', 'float2', 'float3', 'float4'];
              const delays = ['0s', '0.8s', '0.4s', '1.2s'];
              return (
                <FadeSection key={agent.name} delay={i * 80}>
                  <a
                    href="/signup"
                    className={`agent-card group relative flex flex-col bg-white/5 backdrop-blur-sm border-t-2 ${agent.border} border-b border-l border-r border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden h-full`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%, ${agent.glow} 0%, transparent 70%)` }} />
                    <div className="flex justify-center mb-4 relative z-10">
                      <div style={{ animation: `${anims[i]} 3s ease-in-out infinite`, animationDelay: delays[i], filter: `drop-shadow(0 4px 12px ${agent.glow})` }}>
                        <Image src={agent.avatar} alt={agent.name} width={96} height={96} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${agent.badge}`}>{agent.tier}</span>
                      <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                      <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">{agent.title}</p>
                      <p className="text-white/60 text-sm leading-relaxed mb-4">{agent.description}</p>
                      <div className="agent-cta text-sm font-semibold" style={{ color: agent.color }}>→ Try Free</div>
                    </div>
                  </a>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rank Everywhere */}
      <RankEverywhere />

      {/* Demo video */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Watch RankMind in action</h2>
          <p className="text-white/60 mb-8">A short demo of RankMind AI.</p>
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10" style={{ paddingTop: '56.25%' }}>
            <iframe
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/OJ3mUruawVA"
              title="RankMind AI demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-white/60 text-lg">Set it up once. The agents keep working while your subscription is active.</p>
            </div>
          </FadeSection>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-violet-500 via-cyan-500 to-transparent hidden md:block" />
            <div className="space-y-8">
              {[
                { step: '01', title: 'Add Your Website', desc: "Enter your website URL and target keywords. Our agents analyze the site and ask clarifying questions to understand your goals." },
                { step: '02', title: 'Agents Get to Work', desc: 'RankBot audits your site, LinkBot finds relevant prospects, GEO-G prepares AI-search content, and ContentAI drafts SEO content.' },
                { step: '03', title: 'You Approve, Agents Act', desc: 'LinkBot drafts personalised outreach and ContentAI drafts content. Nothing is sent or published without your approval.' },
                { step: '04', title: 'You See What Happened', desc: 'Weekly reports show audits run, prospects contacted, replies received, content drafted, and links earned — with dates.' },
              ].map((item, i) => (
                <FadeSection key={item.step} delay={i * 100}>
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold z-10">
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductScreenshots />

      {/* Sample weekly report — illustrative only, not a customer result */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeSection>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4">What a weekly report looks like</h2>
              <p className="text-white/60 text-lg">Weekly reports show audits run, prospects contacted, replies received, content drafted, and links earned — with dates.</p>
            </div>
          </FadeSection>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <p className="text-white/60 text-sm mb-6">Sample report — illustrative data, not a customer result</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"><span className="text-white/60">Audits run</span><span className="font-semibold">4</span></div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"><span className="text-white/60">Prospects contacted</span><span className="font-semibold">6</span></div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"><span className="text-white/60">Replies received</span><span className="font-semibold">1</span></div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"><span className="text-white/60">Content drafted</span><span className="font-semibold">2</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-white/60">Links earned</span><span className="font-semibold">0</span></div>
            </div>
            <p className="text-white/40 text-xs mt-6">In a real report, each item carries its date. No customer is quoted here: RankMind AI publishes no customer testimonials or performance statistics without permission and evidence.</p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-white/[0.015]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeSection>
            <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-5">THE FOUNDER</p>
            <h2 className="text-4xl font-bold mb-3">Tabish Zaidi</h2>
            <p className="text-sm text-white/50 mb-6 tracking-widest uppercase">Founder, Arabian AI Lab &nbsp;&middot;&nbsp; Dubai, UAE</p>
            <p className="text-base text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">Tabish founded Arabian AI Lab in Dubai and has spent 20+ years in enterprise technology across the Middle East and Africa. He teaches AI to entrepreneurs in Dubai and built RankMind AI so small businesses can run weekly SEO and AI-visibility work without an agency retainer — with every outreach pitch approved by the owner first.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://arabianailab.com" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
                Arabian AI Lab &rarr;
              </a>
              <a href="https://tabishzaidi.com" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 border border-violet-500 text-violet-400 hover:bg-violet-500/10 rounded-lg text-sm font-medium transition-colors">
                About Tabish &rarr;
              </a>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* Pricing — Section 8: Annual toggle, Section 9: trust strip, Section 10: CTA copy */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-white/60 text-lg">Billed monthly · cancel anytime · 7-day money-back guarantee for first-time subscribers.</p>

              {/* Section 8 — Monthly / Annual toggle */}
            </div>
          </FadeSection>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <FadeSection key={plan.name} delay={i * 80}>
                <div className={`relative rounded-2xl p-8 h-full flex flex-col ${plan.popular ? 'bg-gradient-to-b from-violet-600/20 to-cyan-600/10 border-2 border-violet-500/50 shadow-lg shadow-violet-500/10' : 'bg-white/5 border border-white/10'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">MOST POPULAR</div>
                  )}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{plan.name}</h3>

                    </div>
                    <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-white/50">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <PricingButton
                    planKey={plan.planKey}
                    cta={plan.cta}
                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  />
                </div>
              </FadeSection>
            ))}
          </div>

          {/* Section 9 — Money-back guarantee trust strip */}
          <FadeSection>
            <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <svg className="w-7 h-7 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-white font-medium text-[15px]">7-day money-back guarantee for first-time subscribers</p>
                <p className="text-white/60 text-[13px] mt-0.5">Not happy within 7 days of your first payment? Request a full refund — approved refunds are processed within 5–10 business days. See the Refund Policy for eligibility.</p>
              </div>
            </div>
          </FadeSection>
        </div>

          {/* Pricing FAQ — answers match /terms and /refunds exactly */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Pricing questions</h3>
            <div className="space-y-3">
              <FAQItem
                q="What does the 7-day money-back guarantee cover?"
                a="First-time subscribers may request a full refund of the initial subscription payment within 7 days of the initial charge, if they have not previously received a refund and their account is in good standing. Renewal charges after the initial 7-day period, partial months of service after cancellation, add-on credits or one-time purchases, and accounts terminated for Terms of Service violations are not eligible. Approved refunds are processed within 5–10 business days to the original payment method."
              />
              <FAQItem
                q="How do I cancel?"
                a="You may cancel at any time from your account Settings page or by contacting support. Cancellation stops future billing but does not automatically trigger a refund. Your access continues until the end of the current billing period. Subscriptions automatically renew unless cancelled before the renewal date."
              />
              <FAQItem
                q="Can I change plans?"
                a="The Terms of Service state that downgrading your plan takes effect at the end of the current billing period. Upgrade timing is not stated in the Terms of Service or the Refund Policy."
              />
              <FAQItem
                q="What happens after 7 days?"
                a="After the initial 7-day period, renewal charges are not eligible for refunds, and partial months of service after cancellation are not eligible. Your subscription continues on a monthly basis, billed in advance, and automatically renews unless you cancel before the renewal date. If you cancel, your access continues until the end of the current billing period."
              />
            </div>
          </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeSection>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-white/60">Everything you need to know about RankMind AI.</p>
            </div>
          </FadeSection>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeSection key={faq.q} delay={i * 50}>
                <FAQItem q={faq.q} a={faq.a} />
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeSection>
            <h2 className="text-4xl font-bold mb-4">Ready to see your SEO score?</h2>
            <p className="text-white/60 text-lg mb-8">Start with a free SEO audit. No credit card required.</p>
            <Link href="/free-audit" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-10 py-4 rounded-xl transition-all text-lg">
              Get Your Free SEO Audit <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo-icon-v2.png" alt="RankMind AI" width={28} height={28} className="rounded-lg" />
                <span className="font-semibold">RankMind AI</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs">AI agents that audit, fix and grow your search and AI visibility — with your approval before outreach or publishing.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-white/60 font-medium mb-3">Product</div>
                <div className="space-y-2">
                  <a href="#features" className="block text-white/60 hover:text-white transition-colors">Features</a>
                  <a href="#pricing" className="block text-white/60 hover:text-white transition-colors">Pricing</a>
                  <a href="#how-it-works" className="block text-white/60 hover:text-white transition-colors">How It Works</a>
                  <a href="#faq" className="block text-white/60 hover:text-white transition-colors">FAQ</a>
                </div>
              </div>
              <div>
                <div className="text-white/60 font-medium mb-3">Legal</div>
                <div className="space-y-2">
                  <Link href="/privacy" className="block text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="block text-white/60 hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/refunds" className="block text-white/60 hover:text-white transition-colors">Refund Policy</Link>
                </div>
              </div>
              <div>
                <div className="text-white/60 font-medium mb-3">Company</div>
                <div className="space-y-2">
                  <Link href="/about" className="block text-white/60 hover:text-white transition-colors">About</Link>
                  <a href="mailto:info@rank-mind.com" className="block text-white/60 hover:text-white transition-colors">Email Support</a>
                  <Link href="/login" className="block text-white/60 hover:text-white transition-colors">Sign In</Link>
                  <Link href="/signup" className="block text-white/60 hover:text-white transition-colors">Get Started</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-5 mb-6">
            <a href="https://x.com/rankmindai" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="Follow RankMind on X">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com/company/rankmind-ai" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="Follow RankMind on LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-white/60 text-sm mb-1">&copy; 2026 RankMind AI. All rights reserved.</p>
            <p className="text-white/60 text-xs mb-1.5">
              Researched &amp; Developed by{' '}
              <a href="https://arabianailab.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white font-medium transition-colors">
                Arabian AI Lab
              </a>
            </p>
            <p className="text-white/25 text-xs">Marketed &amp; Operated by Jeem &amp; Co FZC LLC, Sharjah Publishing City Free Zone, Sharjah, UAE</p>
          </div>
        </div>
      </footer>

      {/* Support Chat Widget */}
      <a
        href="mailto:info@rank-mind.com"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-110 transition-transform"
        title="Contact Support"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </a>
    </div>
  );
}
