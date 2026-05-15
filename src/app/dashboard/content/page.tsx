'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Sparkles, Calendar, FileText, Code2, ChevronLeft, ChevronRight, Link, BookOpen, LayoutTemplate, HelpCircle, FileStack } from 'lucide-react';

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
  { id: 4, title: 'Local SEO Landing Page  New York', type: 'landing-page', score: 91, status: 'published', date: 'Nov 20, 2024' },
  { id: 5, title: 'Frequently Asked Questions: Technical SEO', type: 'faq-page', score: 83, status: 'review', date: 'Nov 18, 2024' },
  { id: 6, title: 'Link Building Strategies for 2024', type: 'blog-post', score: 68, status: 'draft', date: 'Nov 15, 2024' },
  { id: 7, title: 'E-Commerce SEO Landing Page', type: 'landing-page', score: 79, status: 'review', date: 'Nov 12, 2024' },
  { id: 8, title: 'Comprehensive Keyword Research Guide', type: 'pillar-content', score: 88, status: 'published', date: 'Nov 8, 2024' },
];

const SCHEMA_JSON = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Ultimate Guide to On-Page SEO in 2024",
  "author": {
    "@type": "Person",
    "name": "Content Studio AI"
  },
  "datePublished": "2024-12-01",
  "dateModified": "2024-12-01",
  "description": "A comprehensive guide covering all aspects of on-page SEO optimization for 2024.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/guides/on-page-seo"
  }
}`;

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

const TYPE_COLORS: Record<string, string> = {
  'blog-post': 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
  'landing-page': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  'pillar-content': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  'faq-page': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
};

const DOT_COLORS = ['bg-brand-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'];

const CALENDAR_EVENTS: Record<number, string> = {
  1: 'bg-brand-500', 8: 'bg-violet-500', 12: 'bg-sky-500', 15: 'bg-emerald-500',
  18: 'bg-amber-500', 20: 'bg-brand-500', 25: 'bg-rose-500', 28: 'bg-violet-500',
};

function getScoreColor(score: number) {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#f59e0b';
  return '#ef4444';
}

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Content Studio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate AI-optimized content for LLM readability</p>
          </div>
        </div>

        {/* Generate Section */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate Content</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Topic / Target Keyword</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. On-page SEO best practices 2024"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content Type</label>
              <div className="relative">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">URL Context (optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={urlContext}
                  onChange={(e) => setUrlContext(e.target.value)}
                  placeholder="https://yoursite.com/existing-page"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-brand-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
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
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Content List */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Content Library</h2>
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{MOCK_CONTENT.length} items</span>
            </div>
            <div className="space-y-3">
              {MOCK_CONTENT.map((item) => (
                <Card key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <ScoreRing
                        score={item.score}
                        size={50}
                        strokeWidth={5}
                        label=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type]}`}>
                          {CONTENT_TYPES.find((t) => t.value === item.type)?.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[item.status]}`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">LLM Score</div>
                      <div className="text-lg font-bold" style={{ color: getScoreColor(item.score) }}>{item.score}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Content Calendar */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-500" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Content Calendar</h2>
              </div>
              <div className="flex items-center justify-between mb-3">
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{monthName}</span>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarCells.map((day, idx) => (
                  <div key={idx} className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${day ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer' : ''} ${day === 1 ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${day === 1 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'}`}>{day}</span>
                        {CALENDAR_EVENTS[day] && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${CALENDAR_EVENTS[day]}`} />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Legend</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {[
                    { color: 'bg-brand-500', label: 'Blog Post' },
                    { color: 'bg-violet-500', label: 'Landing' },
                    { color: 'bg-sky-500', label: 'Pillar' },
                    { color: 'bg-emerald-500', label: 'FAQ' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Schema Suggestions */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-brand-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Schema Suggestions</h2>
                </div>
                <button className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Copy</button>
              </div>
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 dark:bg-slate-950 rounded-t-xl border border-slate-700 dark:border-slate-700 border-b-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-slate-400">JSON-LD Schema</span>
                </div>
                <pre className="bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-700 rounded-b-xl p-4 text-xs text-slate-300 dark:text-slate-300 overflow-x-auto overflow-y-auto max-h-72 font-mono leading-relaxed">
                  <code>{SCHEMA_JSON}</code>
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Schema validated  6 properties detected</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
