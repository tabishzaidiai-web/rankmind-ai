'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, Info } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectMessage = searchParams.get('message');
  const redirectPath = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const isLocked = lockedUntil && new Date() < lockedUntil;
  const minutesLeft = lockedUntil ? Math.ceil((lockedUntil.getTime() - Date.now()) / 60000) : 0;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    setLoading(true);
    try {
      const supabase = await createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockout = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
          setLockedUntil(lockout);
          setError(`Too many failed attempts. Your account is temporarily locked for ${LOCKOUT_MINUTES} minutes.`);
        } else if (newAttempts >= 3) {
          setError(`Incorrect email or password. Please try again — ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining before lockout.`);
        } else {
          setError('Incorrect email or password. Please try again.');
        }
      } else {
        setFailedAttempts(0);
        router.push(redirectPath || '/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const supabase = await createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-white/50 text-sm mb-6">Sign in to your RankMind AI account</p>

        {/* Redirect message banner */}
        {redirectMessage && !error && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-sm mb-5 bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Rate limit / error banner */}
        {error && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm mb-5 ${isLocked ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{isLocked ? `Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.` : error}</span>
          </div>
        )}

        {/* Google OAuth — brand compliant */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || !!isLocked}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50 border border-gray-200 shadow-sm"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-[14px]">{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0a0f] px-3 text-white/40">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={!!isLocked}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/60">Password</label>
              <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={!!isLocked}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!isLocked}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
