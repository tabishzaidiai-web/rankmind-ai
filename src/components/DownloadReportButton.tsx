'use client';

/**
 * RankMind AI — DownloadReportButton
 *
 * Behaviour:
 *  - Paid users (starter / growth / enterprise): POST to /api/reports/generate,
 *    receive PDF blob, trigger browser download.
 *  - Free users: show upgrade modal with link to /#pricing.
 *  - Loading state: spinner + "Generating Report…" text.
 *  - Error state: red inline message.
 */

import { useState } from 'react';
import { Download, Loader2, Lock, X, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Minimal required fields — the full AuditResult is a superset of this
interface AuditData {
  url: string;
  analyzed_at: string;
  overall_score: number;
  grade: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DownloadReportButtonProps {
  auditData: AuditData;
  /** User's subscription tier — passed from parent which already fetched it */
  tier?: string;
  /** Optional extra className for the button wrapper */
  className?: string;
}

export default function DownloadReportButton({
  auditData,
  tier = 'free',
  className = '',
}: DownloadReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPaid = tier !== 'free';

  const handleDownload = async () => {
    setError(null);

    // Free users → show upgrade modal
    if (!isPaid) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: auditData.url,
          reportType: 'seo-audit',
          auditData,
        }),
      });

      if (res.status === 403) {
        // Shouldn't happen if tier check is correct, but handle gracefully
        setShowUpgrade(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate report');
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const safeHost = auditData.url
        .replace(/^https?:\/\//, '')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .slice(0, 50);
      const date = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `RankMind-SEO-Report-${safeHost}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Download Button */}
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <button
          onClick={handleDownload}
          disabled={loading}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-200 select-none
            ${isPaid
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40'
              : 'bg-white/8 hover:bg-white/12 text-white/70 border border-white/15 hover:border-violet-500/40'
            }
            ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : isPaid ? (
            <Download className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Lock className="w-4 h-4 flex-shrink-0" />
          )}
          <span>
            {loading ? 'Generating Report…' : 'Download PDF Report'}
          </span>
          {!isPaid && (
            <span className="ml-1 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-medium">
              Paid
            </span>
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">!</span>
            {error}
          </p>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpgrade(false); }}
        >
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">PDF Reports</h3>
                  <p className="text-white/40 text-xs">Available on paid plans</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgrade(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* What's included */}
            <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                What&apos;s included in your report
              </p>
              {[
                'Full SEO score breakdown with grade',
                'On-page, technical & content analysis',
                'E-E-A-T & AI search readiness scores',
                'Keyword opportunities table',
                'Prioritised 10-item action plan',
                '30-day SEO roadmap',
                'Branded PDF — share with clients',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-4 text-center">
              <p className="text-white/50 text-xs mb-0.5">Flash Sale — limited time</p>
              <p className="text-white font-bold text-lg">
                From <span className="text-violet-400">$5/mo</span>
                <span className="text-white/30 text-sm line-through ml-2">$29</span>
              </p>
              <p className="text-white/40 text-xs">Starter plan · Unlimited reports</p>
            </div>

            {/* CTA */}
            <Link
              href="/#pricing"
              onClick={() => setShowUpgrade(false)}
              className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Upgrade to Download Reports
            </Link>
            <button
              onClick={() => setShowUpgrade(false)}
              className="block w-full text-center text-white/30 hover:text-white/50 text-xs mt-2 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
