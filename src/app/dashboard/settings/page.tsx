import { createClient } from '@/lib/supabase/server';
import { Settings, CreditCard, User, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, current_period_end, stripe_customer_id')
    .eq('id', user?.id)
    .single();

  const plan = userData?.plan_name || 'free';
  const status = userData?.subscription_status || 'inactive';
  const periodEnd = userData?.current_period_end
    ? new Date(userData.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const planDetails: Record<string, { name: string; price: string; color: string }> = {
    free: { name: 'Free', price: '$0/mo', color: 'text-white/60' },
    starter: { name: 'Starter', price: '$29/mo', color: 'text-violet-400' },
    growth: { name: 'Growth', price: '$79/mo', color: 'text-cyan-400' },
    enterprise: { name: 'Enterprise', price: '$149/mo', color: 'text-amber-400' },
  };

  const currentPlan = planDetails[plan] || planDetails.free;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/50 text-sm">Manage your account and subscription</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-white/60" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Name</span>
            <span className="text-sm text-white">{user?.user_metadata?.full_name || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Email</span>
            <span className="text-sm text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/50">User ID</span>
            <span className="text-xs text-white/30 font-mono">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-white/60" />
          <h2 className="font-semibold text-white">Subscription</h2>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Current Plan</span>
            <span className={`text-sm font-semibold ${currentPlan.color}`}>{currentPlan.name} — {currentPlan.price}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Status</span>
            <span className={`text-sm font-medium ${status === 'active' ? 'text-emerald-400' : 'text-white/40'}`}>
              {status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          {periodEnd && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/50">Renews On</span>
              <span className="text-sm text-white">{periodEnd}</span>
            </div>
          )}
        </div>

        {plan === 'free' || status !== 'active' ? (
          <div className="space-y-3">
            <p className="text-sm text-white/50">Upgrade to unlock all AI agents and automation features.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'starter', name: 'Starter', price: '$29/mo', features: 'SEO Audit + Reports' },
                { key: 'growth', name: 'Growth', price: '$79/mo', features: 'Audit + Backlinks' },
                { key: 'enterprise', name: 'Enterprise', price: '$149/mo', features: 'All Agents' },
              ].map((p) => (
                <Link
                  key={p.key}
                  href={`/api/stripe/checkout?plan=${p.key}`}
                  className="block p-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center"
                >
                  <div className="font-semibold text-white text-sm">{p.name}</div>
                  <div className="text-violet-400 text-sm font-bold">{p.price}</div>
                  <div className="text-xs text-white/40 mt-1">{p.features}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <a
            href="https://billing.stripe.com/p/login/test_00g000000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Manage Billing
          </a>
        )}
      </div>

      {/* Security */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-white/60" />
          <h2 className="font-semibold text-white">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <div className="text-sm text-white">Auth Provider</div>
              <div className="text-xs text-white/40">{user?.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}</div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Connected</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-white">Last Sign In</div>
              <div className="text-xs text-white/40">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
