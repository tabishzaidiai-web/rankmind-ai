'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, Link2, BarChart3, CheckCircle, Star, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon-v2.png" alt="RankMind AI" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl">RankMind AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg">
              Start Free SEO Audit <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-lg">
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-white/40">No credit card required. Free SEO audit included.</p>
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
      </section>

      {/* Agent Showcase */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Your AI Agents</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Four powerful AI agents working 24/7 to dominate search rankings for your clients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                avatar: '/agent-rankbot-transparent.png',
                name: 'RankBot',
                title: 'SEO Audit Agent',
                description: 'Deep crawls your website, scores 20+ SEO factors, finds quick wins, and creates a prioritized action plan.',
                glow: 'shadow-violet-500/30',
                border: 'border-violet-500/30',
                bg: 'from-violet-500/10 to-purple-600/5',
                badge: 'bg-violet-500/20 text-violet-300',
                tier: 'Starter',
              },
              {
                avatar: '/agent-linkbot-transparent.png',
                name: 'LinkBot',
                title: 'Backlink Builder',
                description: 'Finds real DA 40+ websites in your niche, writes guest posts, sends outreach emails, and tracks results.',
                glow: 'shadow-teal-500/30',
                border: 'border-teal-500/30',
                bg: 'from-teal-500/10 to-cyan-600/5',
                badge: 'bg-teal-500/20 text-teal-300',
                tier: 'Growth',
              },
              {
                avatar: '/agent-geog-transparent.png',
                name: 'GEO-G',
                title: 'GEO Optimizer',
                description: 'Optimizes your content to appear in ChatGPT, Perplexity, Google AI Overviews, and other AI search engines.',
                glow: 'shadow-blue-500/30',
                border: 'border-blue-500/30',
                bg: 'from-blue-500/10 to-cyan-600/5',
                badge: 'bg-blue-500/20 text-blue-300',
                tier: 'Enterprise',
              },
              {
                avatar: '/agent-contentai-transparent.png',
                name: 'ContentAI',
                title: 'Content Writer',
                description: 'Generates SEO-optimized blog posts, landing pages, and meta content that ranks and converts.',
                glow: 'shadow-amber-500/30',
                border: 'border-amber-500/30',
                bg: 'from-amber-500/10 to-orange-600/5',
                badge: 'bg-amber-500/20 text-amber-300',
                tier: 'Enterprise',
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className={`relative bg-gradient-to-b ${agent.bg} border ${agent.border} rounded-2xl p-6 hover:scale-105 transition-transform duration-300 overflow-hidden`}
              >
                {/* Floating agent avatar */}
                <div className="flex justify-center mb-4">
                  <div className={`relative w-32 h-32 drop-shadow-2xl ${agent.glow}`}
                    style={{ animation: 'float 3s ease-in-out infinite' }}>
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${agent.badge}`}>
                  {agent.tier}
                </div>
                <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">{agent.title}</p>
                <p className="text-white/60 text-sm leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/60 text-lg">Set it up once. The agents work forever.</p>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Add Your Website', desc: 'Enter your client\'s URL and target keywords. Our agents analyze the site and ask clarifying questions to understand your goals.' },
              { step: '02', title: 'Agents Get to Work', desc: 'The SEO Audit Agent scores your site, the Backlink Builder finds opportunities, the GEO Optimizer prepares AI-search content.' },
              { step: '03', title: 'Real Actions Taken', desc: 'Agents write real outreach emails, submit guest posts, create content, and track everything in your dashboard.' },
              { step: '04', title: 'You See Results', desc: 'Weekly reports show new backlinks earned, ranking improvements, and GEO visibility scores — all real, measurable results.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/60 text-lg">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$29',
                desc: 'Perfect for individual websites',
                features: [
                  'Full SEO Audit (20+ factors)',
                  'Weekly automated reports',
                  'Keyword tracking (up to 20)',
                  'Email support',
                  '1 website',
                ],
                cta: 'Start with Starter',
                popular: false,
              },
              {
                name: 'Growth',
                price: '$79',
                desc: 'For agencies and growing businesses',
                features: [
                  'Everything in Starter',
                  'Backlink Builder Agent',
                  '10 backlinks/week guaranteed',
                  'Outreach email automation',
                  'Google Sheets tracking',
                  '5 websites',
                ],
                cta: 'Start with Growth',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: '$149',
                desc: 'Full SEO machine for agencies',
                features: [
                  'Everything in Growth',
                  'GEO Optimizer Agent',
                  'AI Content Writer Agent',
                  'ChatGPT/Perplexity visibility',
                  'Custom agent instructions',
                  'Unlimited websites',
                  'Priority support',
                ],
                cta: 'Start with Enterprise',
                popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 ${plan.popular ? 'bg-gradient-to-b from-violet-600/20 to-cyan-600/10 border-2 border-violet-500/50' : 'bg-white/5 border border-white/10'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-white/50">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'SEO Agency Owner', text: 'RankMind AI built 40 real backlinks for my client in the first month. Rankings jumped from page 4 to page 1. This is the real deal.' },
              { name: 'Ahmed M.', role: 'E-commerce Founder', text: 'The GEO optimizer got my product appearing in ChatGPT recommendations. I\'ve never seen anything like it.' },
              { name: 'Lisa T.', role: 'Digital Marketing Manager', text: 'We manage 15 client websites. RankMind AI handles all the SEO work automatically. It\'s like having 5 extra team members.' },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Dominate Search Rankings?</h2>
          <p className="text-white/60 text-lg mb-8">Start with a free SEO audit. No credit card required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-10 py-4 rounded-xl transition-all text-lg">
            Get Your Free SEO Audit <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon-v2.png" alt="RankMind AI" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold">RankMind AI</span>
          </div>
          <p className="text-white/40 text-sm">&copy; 2025 RankMind AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:support@rankmind.ai" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
