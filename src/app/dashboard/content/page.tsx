'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Calendar, FileText, ChevronLeft, ChevronRight, Link, BookOpen, LayoutTemplate, HelpCircle, FileStack, Code2 } from 'lucide-react';

const CONTENT_TYPES = [
  { value: 'blog-post', label: 'Blog Post', icon: BookOpen },
  { value: 'landing-page', label: 'Landing Page', icon: LayoutTemplate },
  { value: 'pillar-content', label: 'Pillar Content', icon: FileStack },
  { value: 'faq-page', label: 'FAQ Page', icon: HelpCircle },
];

const MOCK_CONTENT = [
  { id: 1, title: 'Ultimate Guide to On-Page SEO in 2024', type: 'pillar-content', score: 94, status: 'published', date: 'Dec 1, 2024' },
  { id: 2, title: 'How to Optimize for Featured Snippets', type: 'blog-post', score: 87, status: 'published', date: 'Nov 28, 2024' },
  { id: 3, title: 'Core Web Vitals Explained', type: 'blog-post', score: 76, status: 'draft', date: 'Nov 25, 2024' },
  { id: 4, title: 'Local SEO Landing Page — New York', type: 'landing-page', score: 91, status: 'published', date: 'Nov 20, 2024' },
  { id: 5, title: 'Frequently Asked Questions: Technical SEO', type: 'faq-page', score: 83, status: 'review', date: 'Nov 18, 2024' },
  { id: 6, title: 'Link Building Strategies for 2024', type: 'blog-post', score: 68, status: 'draft', date: 'Nov 15, 2024' },
];

const SCHEMA_JSON = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Ultimate Guide to On-Page SEO in 2024",
  "author": { "@type": "Person", "name": "ContentAI" },
  "datePublished": "2024-12-01"
}`;

const CALENDAR_EVENTS: Record<number, string> = {
  1: 'bg-violet-500', 8: 'bg-amber-500', 12: 'bg-teal-500', 15: 'bg-emerald-500',
  18: 'bg-amber-500', 20: 'bg-violet-500', 25: 'bg-rose-500', 28: 'bg-blue-500',
};

function getScoreColor(score: number) {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#f59e0b';
  return '#ef4444';
}

function ScoreRing({ score, size = 50 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getScoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-xs font-bold text-white">{score}</div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-400',
  draft: 'bg-white/10 text-white/50',
  review: 'bg-amber-500/20 text-amber-400',
};

const TYPE_STYLES: Record<string, string> = {
  'blog-post': 'bg-violet-500/20 text-violet-400',
  'landing-page': 'bg-blue-500/20 text-blue-400',
  'pillar-content': 'bg-teal-500/20 text-teal-400',
  'faq-page': 'bg-rose-500/20 text-rose-400',
};

export default function ContentPage() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog-post');
  const [urlContext, setUrlContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMonth] = useState(new Date(2024, 11, 1));

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const calendarCells = (Array.from({ length: firstDayOfMonth }, () => null) as (number | null)[]).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="w-full space-y-6 relative">
      <style>{`@keyframes floatAgent{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-20" style={{ background: 'radial-gradient(circle,#d97706 0%,transparent 70%)', zIndex: 0 }} />

      {/* Header — left/right split */}
      <div className="flex items-start gap-8 relative z-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white mb-1">Content Writer</h1>
          <p className="text-white/50 text-sm mb-6">Generate SEO-optimized content that ranks in both traditional and AI search</p>

          {/* Generate Section */}
          <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Generate Content</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Topic / Target Keyword</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. On-page SEO best practices 2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#0a0a0f]">{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">URL Context (optional)</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="url"
                    value={urlContext}
                    onChange={(e) => setUrlContext(e.target.value)}
                    placeholder="https://yoursite.com/existing-page"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all"
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: floating ContentAI avatar */}
        <div className="hidden md:flex flex-col items-center justify-start pt-2 flex-shrink-0 w-52">
          <div style={{ animation: 'floatAgent 3s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(217,119,6,0.5))' }}>
            <Image src="/agent-contentai-transparent.png" alt="ContentAI" width={220} height={220} className="w-48 h-48 object-contain" />
          </div>
          <span className="text-sm font-semibold text-amber-300 mt-2">ContentAI</span>
          <span className="text-xs text-white/40">Content Writer</span>
        </div>
      </div>

      {/* Content Library + Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Content List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Content Library</h2>
            <span className="ml-auto text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{MOCK_CONTENT.length} items</span>
          </div>
          <div className="space-y-3">
            {MOCK_CONTENT.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-amber-500/30 hover:bg-white/8 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <ScoreRing score={item.score} size={50} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[item.type]}`}>
                        {CONTENT_TYPES.find((t) => t.value === item.type)?.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-white/40">{item.date}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <div className="text-xs font-medium text-white/40">LLM Score</div>
                    <div className="text-lg font-bold" style={{ color: getScoreColor(item.score) }}>{item.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Content Calendar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Content Calendar</h2>
            </div>
            <div className="flex items-center justify-between mb-3">
              <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-4 h-4 text-white/50" />
              </button>
              <span className="text-sm font-semibold text-white">{monthName}</span>
              <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-white/50" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-white/30 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((day, idx) => (
                <div key={idx} className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${day ? 'hover:bg-white/10 cursor-pointer' : ''}`}>
                  {day && (
                    <>
                      <span className="text-xs font-medium text-white/60">{day}</span>
                      {CALENDAR_EVENTS[day] && (
                        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${CALENDAR_EVENTS[day]}`} />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Schema Preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Schema Markup</h2>
            </div>
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-black/30 rounded-t-xl border border-white/10 border-b-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs text-white/40">JSON-LD Schema</span>
              </div>
              <pre className="bg-black/30 border border-white/10 rounded-b-xl p-4 text-xs text-white/70 overflow-x-auto max-h-48 font-mono leading-relaxed">
                <code>{SCHEMA_JSON}</code>
              </pre>
            </div>
            <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
              <p className="text-xs text-emerald-400">Schema validated — 6 properties detected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
