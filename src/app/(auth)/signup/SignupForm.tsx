'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const PLAN_LABELS: Record<string, { label: string; price: string; color: string }> = {
  starter: { label: 'Starter Plan', price: '$29/mo', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  growth: { label: 'Growth Plan', price: '$79/mo', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  enterprise: { label: 'Enterprise Plan', price: '$149/mo', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
};

function getPasswordStrength(pw: string): { score: number; label: string; color: string; barColor: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '', barColor: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'text-red-400', barColor: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'text-amber-400', barColor: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'text-yellow-400', barColor: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
}

export default function SignupForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || '';
  const planInfo = PLAN_LABELS[plan];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const strength = getPasswordStrength(password);
  const hasMin8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isWeak = password.length > 0 && strength.score <= 1;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWeak) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, selected_plan: plan || 'free' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (signupError) {
      setError(signupError.message);
      setLoading(false);
    } else {
      if (plan) sessionStorage.setItem('rankmind_selected_plan', plan);
      router.push('/verify-email');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    if (plan) sessionStorage.setItem('rankmind_selected_plan', plan);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-white/50 text-sm mb-5">Start with a free SEO audit — no credit card required</p>

        {/* Plan banner */}
        {planInfo && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium mb-5 ${planInfo.color}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            You&apos;re signing up for the <strong>{planInfo.label}</strong> — {planInfo.price}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50 border border-gray-200 shadow-sm"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-600" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-[14px]">Continue with Google</span>
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0a0f] px-3 text-white/40">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                placeholder="Min 8 characters"
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

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { ok: hasMin8, label: '8+ chars' },
                    { ok: hasUpper, label: '1 uppercase' },
                    { ok: hasNumber, label: '1 number' },
                  ].map(({ ok, label }) => (
                    <div key={label} className={`flex items-center gap-1 text-xs ${ok ? 'text-emerald-400' : 'text-white/30'}`}>
                      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isWeak}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isWeak ? 'Password too weak' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/50 text-xs mt-5">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
        </p>

        <p className="text-center text-white/50 text-sm mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
