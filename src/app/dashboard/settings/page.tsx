import { createClient } from '@/lib/supabase/server';
import { Settings, CreditCard, User, Shield, Bell, Plug, Globe, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status, current_period_end, stripe_customer_id, full_name, company_name, timezone')
    .eq('id', user?.id)
    .single();

  const { data: website } = await supabase
    .from('websites')
    .select('id, domain, url, niche, country, language')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  const plan = userData?.plan_name || 'free';
  const status = userData?.subscription_status || 'inactive';
  const periodEnd = userData?.current_period_end
    ? new Date(userData.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const planDetails: Record<string, { name: string; price: string; color: string; bg: string; features: string[] }> = {
    free: { name: 'Free', price: '$0/mo', color: 'text-white/60', bg: 'bg-white/5', features: ['3 demo audits/day', 'No saved history', 'No keyword tracking'] },
    starter: { name: 'Starter', price: '$5/mo', color: 'text-violet-400', bg: 'bg-violet-500/10', features: ['5 SEO audits/month', '50 keywords tracked', '4 articles/month', '5 backlink campaigns'] },
    pro: { name: 'Pro', price: '$15/mo', color: 'text-cyan-400', bg: 'bg-cyan-500/10', features: ['Unlimited audits', '500 keywords', 'Unlimited content', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: '$49/mo', color: 'text-amber-400', bg: 'bg-amber-500/10', features: ['Everything in Pro', 'White-label reports', 'Multi-client management', 'Dedicated support'] },
  };

  const currentPlan = planDetails[plan] || planDetails.free;

  return (
    <div className="space-y-6 max-w-3xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/50 text-sm">Manage your account, integrations, and subscription</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4 text-white/60" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-3">
          {([
            { label: 'Name', value: userData?.full_name || user?.user_metadata?.full_name || 'Not set' },
            { label: 'Email', value: user?.email },
            { label: 'Company', value: userData?.company_name || 'Not set' },
            { label: 'Timezone', value: userData?.timezone || 'UTC' },
            { label: 'User ID', value: (user?.id?.slice(0, 16) || '') + '...', mono: true },
          ] as { label: string; value: string | undefined; mono?: boolean }[]).map(row => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
              <span className="text-sm text-white/50">{row.label}</span>
              <span className={`text-sm text-white ${row.mono ? 'font-mono text-xs text-white/30' : ''}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Website */}
      {website && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <Globe className="w-4 h-4 text-white/60" />
            <h2 className="font-semibold text-white">Primary Website</h2>
          </div>
          <div className="space-y-3">
            {([
              { label: 'Domain', value: website.domain },
              { label: 'URL', value: website.url },
              { label: 'Niche', value: website.niche || 'Not set' },
              { label: 'Country', value: website.country || 'Not set' },
              { label: 'Language', value: website.language || 'English' },
            ] as { label: string; value: string }[]).map(row => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                <span className="text-sm text-white/50">{row.label}</span>
                <span className="text-sm text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="w-4 h-4 text-white/60" />
          <h2 className="font-semibold text-white">Subscription</h2>
        </div>
        <div className={`${currentPlan.bg} border border-white/10 rounded-xl p-4 mb-5`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className={`text-lg font-bold ${currentPlan.color}`}>{currentPlan.name}</span>
              <span className="text-white/40 text-sm ml-2">{currentPlan.price}</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${status === 'active' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-white/40 bg-white/5 border-white/10'}`}>
              {status === 'active' ? 'Active' : plan === 'free' ? 'Free' : 'Inactive'}
            </span>
          </div>
          <ul className="space-y-1.5">
            {currentPlan.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
          {periodEnd && <p className="text-xs text-white/30 mt-3">Renews {periodEnd}</p>}
        </div>
        {plan === 'free' ? (
          <Link href="/pricing" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-sm transition-all">
            Upgrade to Pro <ExternalLink className="w-4 h-4" />
          </Link>
        ) : (
          <a href="/api/stripe/portal" className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-all">
            Manage Billing <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Integrations */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Plug className="w-4 h-4 text-white/60" />
          <h2 className="font-semibold text-white">Integrations</h2>
        </div>
        <div className="space-y-3">
          {['Google Search Console', 'WordPress', 'Webflow', 'Ahrefs', 'Slack'].map(name => (
            <div key={name} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
              <span className="text-sm font-medium text-white">{name}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/30">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-4 h-4 text-white/60" />
          <h2 className="font-semibold text-white">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
            <div>
              <div className="text-sm font-medium text-white">Auth Provider</div>
              <div className="text-xs text-white/40">{user?.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}</div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">Connected</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
            <div>
              <div className="text-sm font-medium text-white">Last Sign In</div>
              <div className="text-xs text-white/40">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <div className="text-sm font-medium text-red-400">Delete Account</div>
              <div className="text-xs text-white/40">Permanently delete your account and all data</div>
            </div>
            <Link href="mailto:support@rank-mind.com?subject=Delete Account Request" className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Request →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
