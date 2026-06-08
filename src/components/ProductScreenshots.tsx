'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const SCREENSHOTS = [
  {
    id: 'seo-audit',
    title: 'Full SEO Audit Dashboard',
    description: 'Score your website across 10 technical SEO factors in real time. Get a prioritised action plan from RankBot — your AI SEO agent.',
    image: '/assets/screenshots/seo-audit-dashboard.png',
    badge: 'RankBot',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  {
    id: 'backlinks',
    title: 'Backlink Tracker & Outreach Log',
    description: 'LinkBot finds high-DA backlink opportunities, enriches contact emails, and tracks your outreach — all automated.',
    image: '/assets/screenshots/backlink-tracker.png',
    badge: 'LinkBot',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'geo',
    title: 'GEO Visibility Report',
    description: 'See how visible your brand is in ChatGPT, Perplexity, and Google AI Overviews. Optimise for the AI search era.',
    image: '/assets/screenshots/geo-visibility.png',
    badge: 'GEO Optimizer',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'reports',
    title: 'Weekly Report + ContentAI',
    description: 'Automated weekly SEO reports with score trends, wins, priority fixes, and AI-generated content ideas tailored to your site.',
    image: '/assets/screenshots/weekly-report.png',
    badge: 'ContentAI',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export default function ProductScreenshots() {
  const [active, setActive] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const prev = () => setActive((a) => (a - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);
  const next = () => setActive((a) => (a + 1) % SCREENSHOTS.length);

  const current = SCREENSHOTS[active];

  return (
    <section id="product" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-violet-400 mb-4">PRODUCT TOUR</p>
          <h2 className="text-4xl font-bold mb-4">See RankMind In Action</h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Four autonomous AI agents working together to grow your search visibility — automatically.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SCREENSHOTS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                i === active
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {s.title.split(' ')[0]} {s.title.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Main screenshot display */}
        <div className="relative group">
          {/* Screenshot card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-white/30 font-mono">app.rank-mind.com/dashboard</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${current.badgeColor}`}>
                {current.badge}
              </span>
            </div>

            {/* Screenshot image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover object-top transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={active === 0}
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0f]/60 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Caption + dots */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white text-lg mb-1">{current.title}</h3>
            <p className="text-white/50 text-sm max-w-lg">{current.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {SCREENSHOTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-gradient-to-r from-violet-500 to-cyan-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to screenshot ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Watch Demo CTA */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-3 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white font-medium rounded-xl transition-all group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
            Watch 60-Second Demo
          </button>
          <p className="text-xs text-white/25 mt-2">See all 4 agents in action</p>
        </div>

      </div>

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-all"
              aria-label="Close video"
            >
              ✕
            </button>
            {/* Placeholder — replace src with your Loom/YouTube embed URL */}
            <div className="aspect-video bg-gradient-to-br from-violet-900/40 to-cyan-900/40 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
              <p className="text-white/60 text-sm">Demo video coming soon</p>
              <p className="text-white/30 text-xs">Replace this with your Loom or YouTube embed</p>
              {/* Uncomment and replace URL when ready:
              <iframe
                src="https://www.loom.com/embed/YOUR_LOOM_ID"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
              */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
