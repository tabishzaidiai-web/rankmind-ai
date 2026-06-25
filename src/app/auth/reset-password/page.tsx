'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user back with a session via the URL hash
  // We need to wait for the auth state to be ready before allowing password update
  useEffect(() => {
    const supabase = await createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check if already in a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const supabase = await createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2500);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password updated!</h2>
          <p className="text-white/60 text-sm mb-4">
            Your password has been changed successfully. Redirecting you to the dashboard...
          </p>
          <div className="w-5 h-5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <nav className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <img src="/logo-icon-v2.png" alt="RankMind AI" className="w-9 h-9 rounded-xl object-contain" />
          <span className="font-bold text-xl text-white">RankMind AI</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>

            <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
            <p className="text-white/50 mb-6 text-sm">
              Enter your new password below. Make it strong — at least 8 characters.
            </p>

            {!sessionReady && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm p-3 rounded-xl mb-4">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                Verifying your reset link...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors text-sm"
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

              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your new password"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none transition-colors text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-violet-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !sessionReady || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
