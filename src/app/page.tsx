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
    description: 'Finds real high-authority websites in your niche, writes guest posts, sends outreach emails, and tracks results.',
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
    description: 'Generates SEO-optimized blog posts, landing pages, and meta content that ranks and converts.',
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

// Section 11 — flash sale FAQ prepended as first item
const FAQS = [
  {
    q: 'What happens to my price after the flash sale ends on June 30?',
    a: 'Nothing changes for you. If you sign up before June 30, your flash sale rate is locked in for life — even after we raise prices. Founding members keep their rate as long as they remain subscribed. After June 30, new signups will pay the standard rates: $29/mo (Starter), $79/mo (Growth), $149/mo (Enterprise).',
  },
  { q: 'Do the agents actually build real backlinks?', a: 'Yes. LinkBot uses Google Search API to find real websites in your niche that accept guest posts, qualifies them by domain authority, and generates personalized outreach emails. You receive the full prospect list with outreach templates via email.' },
  { q: 'How does the GEO Optimizer work?', a: 'GEO-G queries AI models to simulate how ChatGPT, Claude, Perplexity, and Grok answer questions in your niche. It checks if your brand appears in those answers, scores your AI visibility (0–100), and gives you specific recommendations to appear in AI search results.' },
  { q: 'Is there a free trial?', a: 'Yes — every account starts with a free SEO audit. No credit card required. You can run a full 10-factor audit on your website immediately after signing up.' },
  { q: 'Can I use this for client websites?', a: 'Absolutely. The Growth and Enterprise plans support multiple websites. Many agencies use RankMind AI to automate SEO work across all their client accounts.' },
  { q: 'How are reports delivered?', a: 'After each agent run, a full HTML report is emailed to your registered email address. Results are also shown live in your dashboard immediately.' },
  { q: 'What happens if I cancel my subscription?', a: 'You keep access until the end of your billing period. Your data and reports remain accessible for 30 days after cancellation.' },
];

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
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section 1 — hero form submit handler
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = heroUrl.trim();
    if (!url) return;
    router.push(`/free-audit?url=${encodeURIComponent(url)}`);
  };

  // Section 8 — pricing with annual toggle
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      annualPrice: '$22',
      launchPrice: '$5',
      annualLaunchPrice: '$4',
      planKey: 'starter',
      desc: 'Perfect for individual websites',
      features: ['Full SEO Audit (10 key factors)', 'Weekly automated reports', 'Keyword tracking (up to 20)', 'Email support', '1 website'],
      cta: 'Start Ranking Free',
      popular: false,
    },
    {
      name: 'Growth',
      price: '$79',
      annualPrice: '$59',
      launchPrice: '$15',
      annualLaunchPrice: '$11',
      planKey: 'growth',
      desc: 'For agencies and growing businesses',
      features: ['Everything in Starter', 'Backlink Builder Agent', '10 backlinks/week guaranteed', 'Outreach email automation', 'Google Sheets tracking', '5 websites'],
      cta: 'Start Building Backlinks',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$149',
      annualPrice: '$112',
      launchPrice: '$49',
      annualLaunchPrice: '$37',
      planKey: 'enterprise',
      desc: 'Full SEO machine for agencies',
      features: ['Everything in Growth', 'GEO Optimizer Agent', 'AI Content Writer Agent', 'ChatGPT/Perplexity visibility', 'Custom agent instructions', 'Unlimited websites', 'Priority support'],
      cta: 'Get the Full SEO Stack',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
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
              className="md:hidden flex items-center justify-center w-9 h-9 text-white/70 hover:text-white transition-colors text-xl"
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
            Your Website{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Ranks First
            </span>
            {' '}—<br />Automatically
          </h1>
          {/* Section 3 — "your clients" → "your website" */}
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            RankMind AI deploys autonomous SEO agents that build real backlinks, optimize for AI search engines,
            write SEO content, and get your website measurable results — 100% automated.
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
                placeholder="Enter your website URL — e.g. yoursite.com"
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
          {/* Section 1 — social proof line */}
          <p className="text-[13px] text-white/35 mt-2">★★★★★&nbsp; Trusted by founders across 12 countries</p>

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

      {/* Section 4 — Updated stats: 500+ Websites Audited, 12 Countries Reached, 4.9★ Avg Rating */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Websites Audited' },
            { value: '12', label: 'Countries Reached' },
            { value: '4.9★', label: 'Avg. User Rating' },
            { value: 'Flash', label: 'Sale — From $5/mo' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Section 5 — Flash sale clarification line */}
        <p className="text-center text-white/25 text-xs mt-4">Founding members keep this rate for life — renews at $29/mo after June 30</p>
      </section>

      {/* Agent Cards — Section 2: href → /signup, text → Try Free */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Your AI Agents</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Four powerful AI agents working 24/7 to dominate search rankings for your website.
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

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-white/60 text-lg">Set it up once. The agents work forever.</p>
            </div>
          </FadeSection>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-violet-500 via-cyan-500 to-transparent hidden md:block" />
            <div className="space-y-8">
              {[
                { step: '01', title: 'Add Your Website', desc: "Enter your website URL and target keywords. Our agents analyze the site and ask clarifying questions to understand your goals." },
                { step: '02', title: 'Agents Get to Work', desc: 'The SEO Audit Agent scores your site, the Backlink Builder finds opportunities, the GEO Optimizer prepares AI-search content.' },
                { step: '03', title: 'Real Actions Taken', desc: 'Agents write real outreach emails, submit guest posts, create content, and track everything in your dashboard.' },
                { step: '04', title: 'You See Results', desc: 'Weekly reports show new backlinks earned, ranking improvements, and GEO visibility scores — all real, measurable results.' },
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

      {/* Section 7 — Testimonials: between How It Works and Product Tour */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold mb-3">What Early Adopters Are Saying</h2>
              <p className="text-white/60 text-lg">Real feedback from our founding members.</p>
            </div>
          </FadeSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                quote: 'RankBot found 9 technical issues on my site in under 5 minutes. Fixed them all that afternoon. First time my SEO score actually made sense.',
                name: 'Ahmed K.',
                title: 'SaaS Founder',
                location: 'Dubai, UAE',
                initials: 'AK',
                avatarBg: 'bg-teal-600',
              },
              {
                stars: 5,
                quote: 'Finally an SEO tool that doesn\'t require an agency retainer. LinkBot reached out to 6 sites last week. Two came back positive already.',
                name: 'Priya S.',
                title: 'Digital Consultant',
                location: 'Bangalore, India',
                initials: 'PS',
                avatarBg: 'bg-purple-600',
              },
              {
                stars: 5,
                quote: 'The GEO optimizer is genuinely different from anything I\'ve tried. My content is now showing up in Perplexity answers. Wild.',
                name: 'Omar R.',
                title: 'E-commerce Owner',
                location: 'Riyadh, Saudi Arabia',
                initials: 'OR',
                avatarBg: 'bg-blue-600',
              },
            ].map((t, i) => (
              <FadeSection key={t.name} delay={i * 80}>
                <div className="bg-white/5 border border-white/[0.08] rounded-2xl p-5 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <span key={si} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed mb-5 flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${t.avatarBg} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{t.name}</div>
                      <div className="text-white/45 text-xs">{t.title} · {t.location}</div>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Product Tour with embedded YouTube video above tabs */}
      <ProductScreenshots />

      {/* Early Adopter Program */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeSection>
            <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">EARLY ADOPTER PROGRAM</p>
            <h2 className="text-4xl font-bold mb-5">Be Among the First to See Real Results</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              RankMind AI launched in 2026. We are building our first case studies with early adopters right now. Join at flash sale pricing and become one of our first documented success stories.
            </p>
          </FadeSection>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🔬', title: 'Real Audits, Real Data', desc: 'Our SEO audit crawls your actual live website and scores 10 technical factors in real time — not generated data.' },
              { icon: '🤖', title: 'Autonomous Agents', desc: '4 specialist AI agents work on your website automatically every week — auditing, building backlinks, and optimizing for AI search.' },
              { icon: '🔒', title: 'Flash Sale Pricing', desc: 'Lock in the lowest price we will ever offer. Early adopters keep their rate for life — even after we raise prices.' },
            ].map((card, i) => (
              <FadeSection key={card.title} delay={i * 80}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 h-full flex flex-col text-left">
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <div className="font-semibold text-base mb-2">{card.title}</div>
                  <div className="text-white/55 text-sm leading-relaxed">{card.desc}</div>
                </div>
              </FadeSection>
            ))}
          </div>
          <FadeSection>
            <a href="/signup" className="inline-block bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base">
              Join as an Early Adopter &rarr;
            </a>
          </FadeSection>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-white/[0.015]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeSection>
            <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-5">THE PIONEER BEHIND RANKMIND</p>
            <h2 className="text-4xl font-bold mb-3">TABISH BABAR</h2>
            <p className="text-sm text-white/50 mb-6 tracking-widest uppercase">
              Founder, Arabian AI Lab &nbsp;&middot;&nbsp; Digital Architect &nbsp;&middot;&nbsp; Dubai, UAE
            </p>
            <p className="text-base text-white/80 max-w-xl mx-auto mb-5 leading-relaxed">
              A pioneer in the practical application of AI, bridging the speed of Silicon Valley with the luxury craftsmanship of Dubai.
              Making knowledge borderless and opportunity limitless.
            </p>
            <p className="text-base text-white/55 max-w-xl mx-auto mb-8 leading-relaxed italic">
              &ldquo;I built RankMind AI because every business deserves enterprise-grade SEO — not just Fortune 500 companies.
              rank-mind.com runs on its own agents. If it works for us, it will work for you.&rdquo;
            </p>
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
              <p className="text-white/60 text-lg">Flash Sale — lock in your rate before it goes up.</p>
              <p className="text-amber-400 text-sm font-medium mt-2">⏰ Flash Sale pricing expires June 30, 2026 — lock in your rate today</p>

              {/* Section 8 — Monthly / Annual toggle */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setAnnual(false)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnual(true)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    Annual
                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 25%</span>
                  </button>
                </div>
              </div>
              <p className="text-white/35 text-xs mt-2">
                {annual ? 'Billed annually · cancel anytime' : 'Billed monthly · cancel anytime'}
              </p>
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
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">⚡ Flash Sale</span>
                    </div>
                    <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{annual ? plan.annualLaunchPrice : plan.launchPrice}</span>
                      <span className="text-white/50">/month</span>
                      <span className="text-white/40 line-through text-lg ml-1">{annual ? plan.annualPrice : plan.price}</span>
                    </div>
                    <p className="text-amber-400/80 text-xs mt-1">
                      Was {annual ? plan.annualPrice : plan.price}/mo — save {Math.round((1 - parseInt((annual ? plan.annualLaunchPrice : plan.launchPrice).replace('$', '')) / parseInt((annual ? plan.annualPrice : plan.price).replace('$', ''))) * 100)}% during flash sale
                    </p>
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
                  {/* Section 9 — No credit card lock-in line */}
                  <p className="text-[11px] text-white/35 text-center mt-1.5">No credit card lock-in</p>
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
                <p className="text-white font-medium text-[15px]">7-day money-back guarantee — no questions asked</p>
                <p className="text-white/45 text-[13px] mt-0.5">Try any plan risk-free. Not happy within 7 days, we refund you instantly. First-time subscribers only.</p>
              </div>
            </div>
          </FadeSection>
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
            <h2 className="text-4xl font-bold mb-4">Ready to Dominate Search Rankings?</h2>
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
              <p className="text-white/40 text-sm max-w-xs">Autonomous AI agents that build real backlinks, optimize for AI search, and rank your website — automatically.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-white/60 font-medium mb-3">Product</div>
                <div className="space-y-2">
                  <a href="#features" className="block text-white/40 hover:text-white transition-colors">Features</a>
                  <a href="#pricing" className="block text-white/40 hover:text-white transition-colors">Pricing</a>
                  <a href="#how-it-works" className="block text-white/40 hover:text-white transition-colors">How It Works</a>
                  <a href="#faq" className="block text-white/40 hover:text-white transition-colors">FAQ</a>
                </div>
              </div>
              <div>
                <div className="text-white/60 font-medium mb-3">Legal</div>
                <div className="space-y-2">
                  <Link href="/privacy" className="block text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="block text-white/40 hover:text-white transition-colors">Terms of Service</Link>
                </div>
              </div>
              <div>
                <div className="text-white/60 font-medium mb-3">Company</div>
                <div className="space-y-2">
                  <Link href="/about" className="block text-white/40 hover:text-white transition-colors">About</Link>
                  <a href="mailto:support@rankmind.ai" className="block text-white/40 hover:text-white transition-colors">Email Support</a>
                  <Link href="/login" className="block text-white/40 hover:text-white transition-colors">Sign In</Link>
                  <Link href="/signup" className="block text-white/40 hover:text-white transition-colors">Get Started</Link>
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
            <p className="text-white/30 text-sm mb-1">&copy; 2026 RankMind AI. All rights reserved.</p>
            <p className="text-white/35 text-xs mb-1.5">
              Researched &amp; Developed by{' '}
              <a href="https://arabianailab.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white font-medium transition-colors">
                Arabian AI Lab
              </a>
            </p>
            <p className="text-white/25 text-xs">Marketed &amp; Operated by Jeem &amp; Co FZE LLC, Dubai, UAE</p>
          </div>
        </div>
      </footer>

      {/* Support Chat Widget */}
      <a
        href="mailto:support@rankmind.ai"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-110 transition-transform"
        title="Contact Support"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </a>
    </div>
  );
}
