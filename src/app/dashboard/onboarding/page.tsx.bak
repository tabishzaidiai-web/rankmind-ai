'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Your Website' },
  { id: 3, label: 'First Audit' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<Record<string, unknown> | null>(null);
  const [auditError, setAuditError] = useState('');

  const validateUrl = (val: string) => {
    try {
      const u = new URL(val.startsWith('http') ? val : `https://${val}`);
      return u.hostname.includes('.');
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    if (!validateUrl(normalized)) {
      setUrlError('Please enter a valid website URL (e.g. https://yoursite.com)');
      return;
    }
    setUrlError('');
    setUrl(normalized);

    // Save website_url to Supabase user metadata
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { website_url: normalized } });
    }

    setStep(3);
    runFirstAudit(normalized);
  };

  const runFirstAudit = async (targetUrl: string) => {
    setLoading(true);
    setAuditError('');
    try {
      const res = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setAuditResult(data);
    } catch (err: unknown) {
      setAuditError(err instanceof Error ? err.message : 'Audit failed. You can run it manually from the dashboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-10">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step >= s.id
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-gray-700 text-gray-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${step > s.id ? 'bg-purple-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-8">
            <div className="flex justify-center gap-4">
              {['/agent-rankbot-transparent.png', '/agent-linkbot-transparent.png', '/agent-geog-transparent.png', '/agent-contentai-transparent.png'].map((src, i) => (
                <div key={i} className="w-20 h-20 relative animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '2s' }}>
                  <Image src={src} alt="Agent" fill className="object-contain drop-shadow-lg" />
                </div>
              ))}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Welcome to RankMind AI</h1>
              <p className="text-gray-400 text-lg max-w-lg mx-auto">
                Your autonomous SEO team is ready. Let&apos;s set up your workspace in 2 minutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { icon: '🔍', title: 'Real SEO Audits', desc: 'Crawl your site and score 20+ factors' },
                { icon: '🔗', title: 'Backlink Building', desc: 'Find and outreach to real link prospects' },
                { icon: '🌐', title: 'GEO Optimization', desc: 'Appear in ChatGPT, Perplexity & more' },
                { icon: '✍️', title: 'Content Writing', desc: 'Generate full SEO-optimized articles' },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity"
            >
              Let&apos;s Get Started →
            </button>
          </div>
        )}

        {/* Step 2: Website URL */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 relative mx-auto mb-4">
                <Image src="/agent-rankbot-transparent.png" alt="RankBot" fill className="object-contain" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">What&apos;s your website?</h2>
              <p className="text-gray-400">RankBot will run your first free SEO audit right now.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <label className="block text-sm font-medium text-gray-300">Your Website URL</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🌐</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-lg"
                  autoFocus
                />
              </div>
              {urlError && <p className="text-red-400 text-sm">{urlError}</p>}
              <p className="text-gray-500 text-xs">
                We&apos;ll crawl this URL, score it across 20+ SEO factors, and email you a full report.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-white/20 text-gray-400 rounded-xl hover:border-white/40 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleUrlSubmit}
                className="flex-2 flex-grow py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Run My First Audit →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: First Audit Running */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 relative mx-auto mb-4">
                <Image
                  src="/agent-rankbot-transparent.png"
                  alt="RankBot"
                  fill
                  className={`object-contain ${loading ? 'animate-pulse' : ''}`}
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {loading ? 'RankBot is auditing your site...' : auditError ? 'Audit Complete' : 'Audit Complete! 🎉'}
              </h2>
              <p className="text-gray-400 text-sm break-all">{url}</p>
            </div>

            {loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                {['Crawling your website...', 'Checking title & meta tags...', 'Analysing heading structure...', 'Scoring page speed...', 'Generating AI recommendations...'].map((msg, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" style={{ animationDelay: `${i * 0.2}s` }} />
                    <span className="text-gray-400 text-sm">{msg}</span>
                  </div>
                ))}
              </div>
            )}

            {!loading && auditResult && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall SEO Score</span>
                  <span className="text-3xl font-bold text-purple-400">
                    {(auditResult as { score?: number }).score ?? '--'}/100
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${(auditResult as { score?: number }).score ?? 0}%` }}
                  />
                </div>
                <p className="text-green-400 text-sm">✓ Full report sent to your email</p>
                <p className="text-gray-400 text-sm">
                  {(auditResult as { summary?: string }).summary || 'Your audit is complete. Check your dashboard for the full breakdown.'}
                </p>
              </div>
            )}

            {!loading && auditError && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <p className="text-yellow-400 text-sm">{auditError}</p>
                <p className="text-gray-400 text-xs mt-2">Don&apos;t worry — you can run audits anytime from the SEO Audit page.</p>
              </div>
            )}

            {!loading && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity"
              >
                Go to My Dashboard →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
