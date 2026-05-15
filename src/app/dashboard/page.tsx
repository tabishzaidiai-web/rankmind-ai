import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BarChart3, Link2, Globe, FileText, ArrowRight, Zap, TrendingUp, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('plan_name, subscription_status')
    .eq('id', user?.id)
    .single();

  const plan = userData?.plan_name || 'free';
  const isActive = userData?.subscription_status === 'active';

  const agents = [
    {
      href: '/dashboard/seo-audit',
      icon: BarChart3,
      title: 'SEO Audit',
      description: 'Analyze any website for SEO issues, keyword opportunities, and technical problems.',
      color: 'from-violet-500 to-purple-600',
      available: true,
      badge: 'Starter+',
    },
    {
      href: '/dashboard/backlinks',
      icon: Link2,
      title: 'Backlink Builder',
      description: 'Find real backlink opportunities and generate outreach emails automatically.',
      color: 'from-cyan-500 to-blue-600',
      available: plan === 'growth' || plan === 'enterprise' || isActive,
      badge: 'Growth+',
    },
    {
      href: '/dashboard/geo-score',
      icon: Globe,
      title: 'GEO Optimizer',
      description: 'Optimize your content for AI search engines like ChatGPT, Perplexity, and Gemini.',
      color: 'from-emerald-500 to-teal-600',
      available: plan === 'enterprise' || isActive,
      badge: 'Enterprise',
    },
    {
      href: '/dashboard/content',
      icon: FileText,
      title: 'Content Writer',
      description: 'Generate SEO-optimized content with AI that ranks in both traditional and AI search.',
      color: 'from-amber-500 to-orange-600',
      available: plan === 'enterprise' || isActive,
      badge: 'Enterprise',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Your AI-powered SEO command center</p>
      </div>

      {/* Plan Banner */}
      {!isActive && (
        <div className="bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="font-semibold text-white">You&apos;re on the Free plan</div>
              <div className="text-sm text-white/50">Upgrade to unlock all AI agents and automation</div>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Audits Run', value: '0', icon: BarChart3, color: 'text-violet-400' },
          { label: 'Backlinks Found', value: '0', icon: Link2, color: 'text-cyan-400' },
          { label: 'GEO Score', value: '--', icon: Globe, color: 'text-emerald-400' },
          { label: 'Content Created', value: '0', icon: FileText, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-white/50">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* AI Agents */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.href}
              href={agent.available ? agent.href : '/pricing'}
              className={`group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:bg-white/8 ${!agent.available ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg`}>
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                  {agent.badge}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{agent.title}</h3>
              <p className="text-sm text-white/50 mb-4">{agent.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                {agent.available ? 'Launch Agent' : 'Upgrade to Unlock'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Getting Started</h2>
        </div>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Run an SEO Audit on your website to find quick wins', href: '/dashboard/seo-audit' },
            { step: '2', text: 'Check your GEO Score to see how visible you are to AI search engines', href: '/dashboard/geo-score' },
            { step: '3', text: 'Build backlinks to boost your domain authority', href: '/dashboard/backlinks' },
          ].map((item) => (
            <Link key={item.step} href={item.href} className="flex items-center gap-3 group">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">{item.text}</span>
              <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-violet-400 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
