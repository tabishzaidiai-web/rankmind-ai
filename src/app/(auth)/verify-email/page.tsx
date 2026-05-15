'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No email found. Please sign up again.');
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (resendError) throw resendError;
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon-v2.png" alt="RankMind AI" width={36} height={36} className="w-9 h-9 object-contain" />
            <span className="text-white font-bold text-lg">RankMind AI</span>
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-violet-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            We&apos;ve sent a verification link to your email address. Click the link in the email to activate your account and access your dashboard.
          </p>

          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>Check your spam or junk folder if you don&apos;t see the email</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>The verification link expires in 24 hours</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>Dashboard access is unlocked after verification</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {resent && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Verification email resent successfully!
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Resending...' : 'Resend verification email'}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Having trouble?{' '}
          <a href="mailto:support@rankmind.ai" className="text-violet-400 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
