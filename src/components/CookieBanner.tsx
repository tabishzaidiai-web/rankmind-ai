'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rankmind_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('rankmind_cookie_consent', 'accepted');
    localStorage.setItem('rankmind_cookie_consent_date', new Date().toISOString());
    setVisible(false);
    // Analytics scripts can now be enabled — dispatch custom event
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
  };

  const decline = () => {
    localStorage.setItem('rankmind_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto bg-[#13131a] border border-white/15 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Cookie className="w-5 h-5 text-violet-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-1">We use cookies to improve your experience</p>
          <p className="text-white/50 text-xs leading-relaxed">
            We use strictly necessary cookies for authentication and optional analytics cookies to understand how you use RankMind AI.
            Analytics cookies are only activated after your consent.{' '}
            <Link href="/privacy#cookies" className="text-violet-400 hover:underline">Learn more</Link>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
