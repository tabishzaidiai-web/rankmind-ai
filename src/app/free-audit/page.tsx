'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, CheckCircle, XCircle, AlertCircle, Lock,
  ArrowRight, Zap, BarChart3, ChevronRight
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Factor {
  name: string;
  score: number;
  label: string;
  detail: string;
  status: 'good' | 'warning' | 'error';
}

interface AuditResult {
  success: boolean;
  url: string;
  overallScore: number;
  grade: string;
  remaining: number;
  factors: {
    meta_title: Factor;
    meta_description: Factor;
    h1_tags: Factor;
    page_speed: Factor;
  };
  lockedFactorCount: number;
  crawledAt: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: 'good' | 'warning' | 'error' }) {
  if (status === 'good') return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
  if (status === 'warning') return <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
}

function ScoreBar({ score, status }: { score: number; status: 'good' | 'warning' | 'error' }) {
  const color = status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-16 flex-shrink-0">
      <div className="flex items-center justify-end gap-1 mb-1">
        <span className="text-xs font-bold text-white">{score}</span>
        <span className="text-xs text-white/40">/100</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function GradeRing({ grade, score }: { grade: string; score: number }) {
  const color =
    grade === 'A' ? 'from-emerald-400 to-cyan-400' :
    grade === 'B' ? 'from-cyan-400 to-violet-400' :
    grade === 'C' ? 'from-amber-400 to-orange-400' :
    'from-red-400 to-pink-400';

  return (
    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} p-0.5 flex-shrink-0`}>
      <div className="w-full h-full rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
        <span className={`text-3xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{grade}</span>
        <span className="text-xs text-white/40">{score}/100</span>
      </div>
    </div>
  );
}

// ── Progress steps ─────────────────────────────────────────────────────────
const PROGRESS_STEPS = [
  'Connecting to website…',
  'Reading HTML structure…',
  'Checking title & meta tags…',
  'Analysing H1 headings…',
  'Measuring server response time…',
  'Calculating SEO score…',
];

// ── Main page ──────────────────────────────────────────────────────────────
export default function FreeAuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runAudit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a website URL');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setRateLimited(false);
    setProgress(0);

    // Animate progress steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < PROGRESS_STEPS.length) {
        setProgressStep(PROGRESS_STEPS[stepIndex]);
        setProgress(Math.round(((stepIndex + 1) / PROGRESS_STEPS.length) * 85));
        stepIndex++;
      }
    }, 600);

    try {
      const res = await fetch('/api/free-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      clearInterval(stepInterval);
      setProgress(100);
      setProgressStep('Done!');

      const data = await res.json();

      if (res.status === 429) {
        setRateLimited(true);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error || 'Audit failed. Please try again.');
        return;
      }

      setResult(data as AuditResult);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      clearInterval(stepInterval);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const signupUrl = result
    ? `/signup?url=${encodeURIComponent(result.url)}`
    : '/signup';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="RankMind AI" width={28} height={28} className="w-7 h-7" />
            <span className="font-bold text-sm">RankMind AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/signup"
              className="text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium px-4 py-2 rounded-xl transition-all"
            >
              Get Full Audit Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            <Zap className="w-4 h-4" />
            Free Instant SEO Audit — No Sign-Up Required
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            How Does Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Website Score?
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Get an instant 4-factor SEO audit in seconds. No account needed.
            See exactly what&apos;s holding your rankings back.
          </p>

          {/* URL Input Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !loading && runAudit()}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-xl text-white placeholder-white/25 text-base transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={runAudit}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all whitespace-nowrap text-base flex items-center gap-2 justify-center"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    Audit My Site
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}

            <p className="mt-3 text-xs text-white/30 text-center">
              3 free audits per hour &bull; No credit card &bull; No account required
            </p>
          </div>
        </div>
      </section>

      {/* Loading Progress */}
      {loading && (
        <section className="pb-16 px-6">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 text-white animate-pulse" />
              </div>
              <p className="text-white/80 text-sm mb-5 font-medium">{progressStep}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/30">{progress}% complete</p>
            </div>
          </div>
        </section>
      )}

      {/* Rate Limited */}
      {rateLimited && (
        <section className="pb-16 px-6">
          <div className="max-w-xl mx-auto bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Free Limit Reached</h3>
            <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
              You&apos;ve used all 3 free audits this hour. Sign up free for unlimited audits, AI recommendations, and weekly automated reports.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all text-sm"
            >
              Get Unlimited Audits Free →
            </Link>
            <p className="text-white/30 text-xs mt-4">No credit card required</p>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section id="results" className="pb-24 px-6">
          <div className="max-w-3xl mx-auto">

            {/* Score header */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row items-center gap-6">
              <GradeRing grade={result.grade} score={result.overallScore} />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs text-white/40 mb-1 font-medium tracking-wider uppercase">Teaser Audit — 4 of 10 factors shown</p>
                <h2 className="text-2xl font-bold mb-1">
                  {result.overallScore >= 80 ? 'Strong foundation!' :
                   result.overallScore >= 60 ? 'Room to improve' :
                   result.overallScore >= 40 ? 'Needs attention' : 'Critical issues found'}
                </h2>
                <p className="text-white/50 text-sm truncate max-w-xs sm:max-w-none">{result.url}</p>
              </div>
              {result.remaining > 0 && (
                <div className="text-center flex-shrink-0">
                  <p className="text-xs text-white/30">{result.remaining} free audit{result.remaining !== 1 ? 's' : ''} left today</p>
                </div>
              )}
            </div>

            {/* 4 factor cards */}
            <div className="space-y-3 mb-4">
              {Object.values(result.factors).map((factor) => (
                <div
                  key={factor.name}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-4 flex items-center gap-4 transition-colors"
                >
                  <StatusIcon status={factor.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">{factor.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        factor.status === 'good' ? 'bg-emerald-500/15 text-emerald-400' :
                        factor.status === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {factor.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 truncate">{factor.detail}</p>
                  </div>
                  <ScoreBar score={factor.score} status={factor.status} />
                </div>
              ))}
            </div>

            {/* Locked factors teaser */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/40 font-medium">6 more factors locked — sign up to unlock</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Page Speed Score', 'Image Alt Tags', 'Schema Markup', 'Canonical Tags', 'Content Quality', 'Internal Links'].map((f) => (
                  <div key={f} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <Lock className="w-3 h-3 text-white/20 flex-shrink-0" />
                    <span className="text-xs text-white/30 truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signup CTA */}
            <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-4">
                <Zap className="w-3.5 h-3.5" />
                Full 10-Factor Audit + AI Agent Recommendations
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Get Your Complete SEO Action Plan
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Sign up free to unlock all 10 SEO factors, get a prioritised action plan from our AI agent,
                track your score weekly, and receive automated improvement reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Link
                  href={signupUrl}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Get Full Audit Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => { setResult(null); setUrl(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all text-sm"
                >
                  Audit Another Site
                </button>
              </div>
              <p className="text-white/30 text-xs">No credit card required &bull; Free plan includes 10 audits/month</p>
            </div>

          </div>
        </section>
      )}

      {/* What you get section (shown before results) */}
      {!result && !loading && !rateLimited && (
        <section className="pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs text-white/30 mb-8 uppercase tracking-widest">What this free audit checks</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {[
                { icon: '📝', title: 'Meta Title', desc: 'Is your title tag the right length and keyword-optimised?' },
                { icon: '📄', title: 'Meta Description', desc: 'Does your description drive clicks from search results?' },
                { icon: '🏷️', title: 'H1 Heading', desc: 'Is your main heading structured correctly for SEO?' },
                { icon: '⚡', title: 'Page Speed', desc: 'How fast does your server respond? Speed is a ranking factor.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-sm text-white/50 mb-3">Want the full 10-factor audit with AI recommendations?</p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Sign up free — no credit card required
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-xs text-white/20">
          &copy; 2026 RankMind AI &bull; Jeem &amp; Co FZE LLC, Dubai, UAE &bull;{' '}
          <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
