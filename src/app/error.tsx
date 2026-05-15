'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <Image src="/logo-icon-v2.png" alt="RankMind AI" width={36} height={36} className="rounded-xl" />
        <span className="font-bold text-xl">RankMind AI</span>
      </Link>

      <div style={{ animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 0 24px rgba(239,68,68,0.4))' }}>
        <Image src="/agent-rankbot-transparent.png" alt="RankBot" width={140} height={140} className="w-32 h-32 object-contain opacity-80" />
      </div>

      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>

      <div className="mt-8 mb-2">
        <span className="text-8xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">500</span>
      </div>
      <h1 className="text-2xl font-bold mb-3">Something Went Wrong</h1>
      <p className="text-white/50 max-w-md mb-8">
        RankBot hit an unexpected error. Our team has been notified. Please try again or go back to the homepage.
      </p>

      {error.digest && (
        <p className="text-white/20 text-xs mb-6 font-mono">Error ID: {error.digest}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
