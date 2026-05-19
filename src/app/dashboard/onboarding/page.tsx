'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Globe, Target, ChevronRight, ChevronLeft, Check, Loader2, MapPin, Zap, BarChart3 } from 'lucide-react';

const NICHES = ['E-commerce','SaaS / Tech','Local Business','Education','Healthcare','Finance','Real Estate','Legal','Travel','Fashion','Food & Restaurant','Construction','Other'];
const COUNTRIES = ['United States','United Kingdom','Canada','Australia','Germany','France','Spain','Italy','Netherlands','Sweden','Norway','Denmark','India','Pakistan','Bangladesh','Nigeria','South Africa','Kenya','Brazil','Mexico','Argentina','Colombia','Chile','Peru','Japan','South Korea','China','Singapore','Malaysia','Indonesia','Philippines','Thailand','Vietnam','UAE','Saudi Arabia','Qatar','Egypt','Morocco','Ghana','New Zealand','Ireland','Portugal','Poland','Czech Republic','Hungary','Romania','Ukraine','Russia','Turkey','Israel','Other'];
const LANGUAGES = ['English','Arabic','Spanish','French','German','Portuguese','Hindi','Mandarin','Japanese','Korean','Italian','Dutch','Polish','Russian','Turkish','Other'];
const SEO_GOALS = [{value:'traffic',label:'Get more website traffic'},{value:'page1',label:'Rank on page 1 for my keywords'},{value:'ai_search',label:'Appear in ChatGPT and AI search results'},{value:'leads',label:'Grow my business leads'},{value:'all',label:'All of the above'}];
const PLANS = [
  {id:'starter',name:'Starter',price:'$29',color:'border-violet-500/50 bg-violet-500/5',badge:null,features:['1 website','SEO audit','4 AI blog posts/month','GEO visibility score','20 keywords tracked']},
  {id:'growth',name:'Growth',price:'$79',color:'border-cyan-500/50 bg-cyan-500/5',badge:'Most Popular',features:['3 websites','Everything in Starter','Backlink research agent','12 AI blog posts/month','Outreach drafts']},
  {id:'agency',name:'Agency',price:'$149',color:'border-amber-500/50 bg-amber-500/5',badge:null,features:['10 websites','Everything in Growth','White-label PDF reports','Client portal','Bulk approvals']},
  {id:'enterprise',name:'Enterprise',price:'$299',color:'border-rose-500/50 bg-rose-500/5',badge:null,features:['Unlimited websites','Everything in Agency','API access','Custom agent instructions','Dedicated onboarding']},
];
const STEP_LABELS = ['Your Website','Target Market','SEO Goals','Choose Plan'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDesc, setBusinessDesc] = useState('');
  const [niche, setNiche] = useState('');
  const [urlError, setUrlError] = useState('');
  const [businessCountry, setBusinessCountry] = useState('');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [isLocal, setIsLocal] = useState(false);
  const [city, setCity] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [keywords, setKeywords] = useState(['','','']);
  const [seoGoal, setSeoGoal] = useState('');
  const [seoRating, setSeoRating] = useState(5);
  const [selectedPlan, setSelectedPlan] = useState('growth');

  const validateUrl = (val: string) => { try { const u = new URL(val.startsWith('http') ? val : `https://${val}`); return u.hostname.includes('.'); } catch { return false; } };
  const toggleTargetCountry = (c: string) => setTargetCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : prev.length < 5 ? [...prev, c] : prev);

  const handleNext = () => {
    if (step === 1) {
      const norm = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      if (!validateUrl(norm)) { setUrlError('Please enter a valid website URL'); return; }
      if (!niche) { setUrlError('Please select your business niche'); return; }
      setUrlError(''); setWebsiteUrl(norm);
    }
    setStep(s => s + 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const domain = new URL(websiteUrl).hostname.replace('www.','');
      const { data: website } = await supabase.from('websites').insert({
        user_id: user.id, url: websiteUrl, domain, business_description: businessDesc, niche,
        country: businessCountry, target_countries: targetCountries.length > 0 ? targetCountries : [businessCountry],
        language, is_local: isLocal, city: isLocal ? city : null, seo_goal: seoGoal, seo_self_rating: seoRating,
      }).select().single();
      if (website) {
        const kwRows = keywords.filter(k => k.trim()).map((k, i) => ({ website_id: website.id, keyword: k.trim(), type: i === 0 ? 'primary' : 'secondary', target_country: targetCountries[0] || businessCountry || 'US' }));
        if (kwRows.length > 0) await supabase.from('keywords').insert(kwRows);
        fetch('/api/seo-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: websiteUrl, websiteId: website.id, background: true }) }).catch(() => {});
      }
      const { error: updateErr } = await supabase
        .from('users')
        .update({ onboarding_completed: true, plan: selectedPlan, website_url: websiteUrl })
        .eq('id', user.id);
      if (updateErr) {
        console.error('Failed to update user profile:', updateErr);
        // Still redirect — website was saved successfully
      }
      router.push('/dashboard?onboarded=1');
    } catch (err) { console.error('Onboarding error:', err); setSaving(false); }
  };

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <Image src="/logo.png" alt="RankMind AI" width={32} height={32} className="rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
        <span className="text-white font-bold text-lg">RankMind AI</span>
      </div>
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const sn = i + 1; const done = step > sn; const active = step === sn;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${done ? 'bg-green-500/20 text-green-400 border border-green-500/30' : active ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                {done ? <Check className="w-3 h-3" /> : <span>{sn}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className={`w-6 h-px ${step > sn ? 'bg-green-500/50' : 'bg-white/10'}`} />}
            </div>
          );
        })}
      </div>
      <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center"><Globe className="w-5 h-5 text-violet-400" /></div>
              <div><h2 className="text-white font-semibold text-xl">About your website</h2><p className="text-white/50 text-sm">Tell us about your business so we can personalise everything</p></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Website URL *</label>
              <input type="url" value={websiteUrl} onChange={e => { setWebsiteUrl(e.target.value); setUrlError(''); }} placeholder="https://yoursite.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm" />
              {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">What does your business do?</label>
              <textarea value={businessDesc} onChange={e => setBusinessDesc(e.target.value)} placeholder="e.g. We sell handmade leather bags online to customers in the UK and Europe" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Business niche / industry *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {NICHES.map(n => (
                  <button key={n} type="button" onClick={() => setNiche(n)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${niche === n ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'}`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-400" /></div>
              <div><h2 className="text-white font-semibold text-xl">Your target market</h2><p className="text-white/50 text-sm">This drives keyword data, content language, and backlink targeting</p></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Business country *</label>
              <select value={businessCountry} onChange={e => setBusinessCountry(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm">
                <option value="" className="bg-gray-900">Select your country...</option>
                {COUNTRIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Target countries for SEO <span className="text-white/30">(up to 5)</span></label>
              <input type="text" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search countries..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm mb-2" />
              {targetCountries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {targetCountries.map(c => <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs">{c}<button onClick={() => toggleTargetCountry(c)}>×</button></span>)}
                </div>
              )}
              <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1">
                {filteredCountries.map(c => <button key={c} type="button" onClick={() => toggleTargetCountry(c)} className={`px-3 py-1.5 rounded-lg text-xs text-left transition-all ${targetCountries.includes(c) ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70'}`}>{c}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Content language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Business reach</label>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setIsLocal(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${!isLocal ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/10 text-white/50'}`}>National / Global</button>
                  <button type="button" onClick={() => setIsLocal(true)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${isLocal ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/10 text-white/50'}`}>Local</button>
                </div>
              </div>
            </div>
            {isLocal && <div><label className="block text-sm font-medium text-white/70 mb-1.5">City or region</label><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Manchester, UK" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm" /></div>}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center"><Target className="w-5 h-5 text-green-400" /></div>
              <div><h2 className="text-white font-semibold text-xl">Your SEO goals</h2><p className="text-white/50 text-sm">We&apos;ll use these to build your keyword strategy and content calendar</p></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Top 3 target keywords <span className="text-white/30">(optional)</span></label>
              <div className="space-y-2">
                {keywords.map((kw, i) => <input key={i} type="text" value={kw} onChange={e => { const u=[...keywords]; u[i]=e.target.value; setKeywords(u); }} placeholder={['e.g. leather bags UK','e.g. handmade leather wallet','e.g. best leather bag brand'][i]} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 text-sm" />)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Main SEO goal</label>
              <div className="space-y-2">
                {SEO_GOALS.map(g => (
                  <button key={g.value} type="button" onClick={() => setSeoGoal(g.value)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${seoGoal === g.value ? 'bg-green-500/15 border-green-500/40 text-green-300' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${seoGoal === g.value ? 'border-green-400 bg-green-400' : 'border-white/30'}`}>{seoGoal === g.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">How would you rate your current SEO? <span className="text-green-400 font-semibold">{seoRating}/10</span></label>
              <input type="range" min={1} max={10} value={seoRating} onChange={e => setSeoRating(Number(e.target.value))} className="w-full accent-green-500" />
              <div className="flex justify-between text-xs text-white/30 mt-1"><span>None at all</span><span>Already ranking well</span></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center"><Zap className="w-5 h-5 text-amber-400" /></div>
              <div><h2 className="text-white font-semibold text-xl">Choose your plan</h2><p className="text-white/50 text-sm">14-day free trial on all plans — no credit card required to start</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANS.map(plan => (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} className={`relative text-left p-4 rounded-xl border transition-all ${selectedPlan === plan.id ? plan.color + ' ring-1 ring-violet-500/40' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
                  {plan.badge && <span className="absolute -top-2 left-3 px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-full">{plan.badge}</span>}
                  {selectedPlan === plan.id && <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  <div className="font-semibold text-white mb-0.5">{plan.name}</div>
                  <div className="text-2xl font-bold text-white">{plan.price}<span className="text-sm font-normal text-white/40">/month</span></div>
                  <ul className="mt-3 space-y-1">{plan.features.map(f => <li key={f} className="flex items-center gap-1.5 text-xs text-white/60"><Check className="w-3 h-3 text-green-400 flex-shrink-0" />{f}</li>)}</ul>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-white/30">You can change or cancel your plan at any time from Settings → Billing.</p>
          </div>
        )}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          {step > 1 ? <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 text-white/50 hover:text-white text-sm transition-colors"><ChevronLeft className="w-4 h-4" />Back</button> : <div />}
          {step < 4 ? (
            <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all">Continue<ChevronRight className="w-4 h-4" /></button>
          ) : (
            <button type="button" onClick={handleComplete} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {saving ? 'Setting up your account...' : 'Start Free Trial'}
            </button>
          )}
        </div>
      </div>
      {step === 4 && (
        <div className="mt-6 w-full max-w-2xl bg-white/[0.02] border border-white/8 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-violet-400" /><span className="text-white/70 text-sm font-medium">What to expect — honest timeline</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[{period:'Month 1–2',desc:'Technical issues fixed. First 4–8 SEO articles published.'},{period:'Month 2–3',desc:'Long-tail keywords reach page 1. First quality backlinks placed.'},{period:'Month 3–6',desc:'Core rankings improve. 10–20 quality backlinks acquired.'},{period:'Month 6–12',desc:'Compound growth. Competitive terms ranking. AI search presence.'}].map(t => (
              <div key={t.period} className="p-3 bg-white/[0.03] rounded-lg border border-white/8"><div className="text-violet-400 font-semibold mb-1">{t.period}</div><div className="text-white/50 leading-relaxed">{t.desc}</div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
