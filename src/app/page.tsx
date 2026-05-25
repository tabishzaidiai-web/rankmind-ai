'use client';

import { useState, useEffect, useRef } from 'react';
import AgentDemo from '@/components/AgentDemo';
import RankEverywhere from '@/components/RankEverywhere';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Star, Zap, ChevronDown, MessageCircle } from 'lucide-react';

const AGENTS = [
  {
    avatar: '/agent-rankbot-transparent.png',
    name: 'RankBot',
    title: 'SEO Audit Agent',
    description: 'Deep crawls your website, scores 20+ SEO factors, finds quick wins, and creates a prioritized action plan.',
    href: '/dashboard/seo-audit',
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
    description: 'Finds real DA 40+ websites in your niche, writes guest posts, sends outreach emails, and tracks results.',
    href: '/dashboard/backlinks',
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
    href: '/dashboard/geo-score',
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
    href: '/dashboard/content',
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
  { q: 'Do the agents actually build real backlinks?', a: 'Yes. LinkBot uses Google Search API to find real websites in your niche that accept guest posts, qualifies them by domain authority, and generates personalized outreach emails. You receive the full prospect list with outreach templates via email.' },
  { q: 'How does the GEO Optimizer work?', a: 'GEO-G queries AI models to simulate how ChatGPT, Claude, Perplexity, and Grok answer questions in your niche. It checks if your brand appears in those answers, scores your AI visibility (0–100), and gives you specific recommendations to appear in AI search results.' },
  { q: 'Is there a free trial?', a: 'Yes — every account starts with a free SEO audit. No credit card required. You can run a full 20-factor audit on your website immediately after signing up.' },
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

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
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
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            RankMind AI deploys autonomous SEO agents that build real backlinks, optimize for AI search engines,
            write SEO content, and get your clients measurable results — 100% automated.
          </p>

          {/* Floating Agent Avatars — each is a clickable link */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            {AGENTS.map((agent, i) => {
              const anims = ['float', 'float2', 'float3', 'float4'];
              const delays = ['0s', '0.5s', '1s', '1.5s'];
              return (
                <Link
                  key={agent.name}
                  href={agent.href}
                  className="group flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div
                    className="relative rounded-2xl p-1 transition-all duration-300 group-hover:scale-105"
                    style={{
                      animation: `${anims[i]} 3s ease-in-out infinite`,
                      animationDelay: delays[i],
                      filter: `drop-shadow(0 0 16px ${agent.glow})`,
                    }}
                  >
                    <Image src={agent.avatar} alt={agent.name} width={100} height={100} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                    {/* Hover glow ring */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ boxShadow: `0 0 0 2px ${agent.color}, 0 0 20px ${agent.glow}` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">{agent.name}</span>
                  <span className="text-xs text-white/0 group-hover:text-white/50 transition-colors -mt-1">Open Agent →</span>
                </Link>
              );
            })}
          </div>

          {/* Live Demo — working inline demo, no signup required */}
          <div className="w-full max-w-3xl mx-auto mt-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                🔍 Live Demo — No signup required
              </span>
            </div>
            <AgentDemo />
          </div>
          <p className="mt-6 text-sm text-white/30">No credit card required. Free SEO audit included.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Backlinks Built' },
            { value: '500+', label: 'Websites Ranked' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '3x', label: 'Average Traffic Increase' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-white/25 text-xs mt-4">* Based on aggregate results across all active accounts since launch.</p>
      </section>

      {/* Agent Cards */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Your AI Agents</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Four powerful AI agents working 24/7 to dominate search rankings for your clients.
              </p>
            </div>
          </FadeSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENTS.map((agent, i) => {
              const anims = ['float', 'float2', 'float3', 'float4'];
              const delays = ['0s', '0.8s', '0.4s', '1.2s'];
              return (
                <FadeSection key={agent.name} delay={i * 80}>
                  <Link
                    href={agent.href}
                    className={`agent-card group relative flex flex-col bg-white/5 backdrop-blur-sm border-t-2 ${agent.border} border-b border-l border-r border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden h-full`}
                    style={{ borderTopColor: agent.color }}
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
                      <div className="agent-cta text-sm font-semibold" style={{ color: agent.color }}>→ Open Agent</div>
                    </div>
                  </Link>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rank Everywhere */}
      <RankEverywhere />

      {/* How It Works — with connector line */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-white/60 text-lg">Set it up once. The agents work forever.</p>
            </div>
          </FadeSection>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-violet-500 via-cyan-500 to-transparent hidden md:block" />
            <div className="space-y-8">
              {[
                { step: '01', title: 'Add Your Website', desc: "Enter your client's URL and target keywords. Our agents analyze the site and ask clarifying questions to understand your goals." },
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

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <h2 className="text-4xl font-bold text-center mb-16">What Our Clients Say</h2>
          </FadeSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'SEO Agency Owner', initials: 'SK', color: 'from-violet-500 to-purple-600', text: "RankMind AI built 40 real backlinks for my client in the first month. Rankings jumped from page 4 to page 1. This is the real deal." },
              { name: 'Ahmed M.', role: 'E-commerce Founder', initials: 'AM', color: 'from-teal-500 to-cyan-600', text: "The GEO optimizer got my product appearing in ChatGPT recommendations. I've never seen anything like it." },
              { name: 'Lisa T.', role: 'Digital Marketing Manager', initials: 'LT', color: 'from-amber-500 to-orange-600', text: "We manage 15 client websites. RankMind AI handles all the SEO work automatically. It's like having 5 extra team members." },
            ].map((t, i) => (
              <FadeSection key={t.name} delay={i * 80}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-white/70 text-sm mb-5 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-white/40 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-white/60 text-lg">Start free. Scale as you grow.</p>
            </div>
          </FadeSection>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter', price: '$29', planKey: 'starter', desc: 'Perfect for individual websites',
                features: ['Full SEO Audit (20+ factors)', 'Weekly automated reports', 'Keyword tracking (up to 20)', 'Email support', '1 website'],
                cta: 'Start with Starter', popular: false,
              },
              {
                name: 'Growth', price: '$79', planKey: 'growth', desc: 'For agencies and growing businesses',
                features: ['Everything in Starter', 'Backlink Builder Agent', '10 backlinks/week guaranteed', 'Outreach email automation', 'Google Sheets tracking', '5 websites'],
                cta: 'Start with Growth', popular: true,
              },
              {
                name: 'Enterprise', price: '$149', planKey: 'enterprise', desc: 'Full SEO machine for agencies',
                features: ['Everything in Growth', 'GEO Optimizer Agent', 'AI Content Writer Agent', 'ChatGPT/Perplexity visibility', 'Custom agent instructions', 'Unlimited websites', 'Priority support'],
                cta: 'Start with Enterprise', popular: false,
              },
            ].map((plan, i) => (
              <FadeSection key={plan.name} delay={i * 80}>
                <div className={`relative rounded-2xl p-8 h-full flex flex-col ${plan.popular ? 'bg-gradient-to-b from-violet-600/20 to-cyan-600/10 border-2 border-violet-500/50 shadow-lg shadow-violet-500/10' : 'bg-white/5 border border-white/10'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">MOST POPULAR</div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
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
                  {/* Plan pre-selection: pass plan query param to signup */}
                  <Link
                    href={`/signup?plan=${plan.planKey}`}
                    className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeSection>
            ))}
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
            <h2 className="text-4xl font-bold mb-4">Ready to Dominate Search Rankings?</h2>
            <p className="text-white/60 text-lg mb-8">Start with a free SEO audit. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-10 py-4 rounded-xl transition-all text-lg">
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
                <div className="text-white/60 font-medium mb-3">Support</div>
                <div className="space-y-2">
                  <a href="mailto:support@rankmind.ai" className="block text-white/40 hover:text-white transition-colors">Email Support</a>
                  <Link href="/login" className="block text-white/40 hover:text-white transition-colors">Sign In</Link>
                  <Link href="/signup" className="block text-white/40 hover:text-white transition-colors">Get Started</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-sm">&copy; 2026 RankMind AI. All rights reserved.</p>
            <p className="text-white/20 text-xs">Built with Next.js · Hosted on Vercel · Powered by OpenAI</p>
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
