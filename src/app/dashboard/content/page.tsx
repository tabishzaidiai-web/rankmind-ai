'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, FileText, Globe, AlertCircle, CheckCircle2, Copy, Download, Loader2, Code2, ArrowRight, Clock, Check, X, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ProgressStep({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-white/60 animate-in fade-in slide-in-from-left-2 duration-300">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 flex-shrink-0" />
      {label}
    </div>
  );
}

const WHATS_NEXT_CONTENT = [
  {
    href: '/dashboard/seo-audit',
    avatar: '/agent-rankbot-transparent.png',
    name: 'RankBot',
    desc: 'Check your SEO score now that you have new content to publish',
    glow: 'rgba(139,92,246,0.35)',
    color: '#7c3aed',
    border: 'border-violet-500/30',
  },
  {
    href: '/dashboard/backlinks',
    avatar: '/agent-linkbot-transparent.png',
    name: 'LinkBot',
    desc: 'Build backlinks to the content you just created to rank faster',
    glow: 'rgba(13,148,136,0.35)',
    color: '#0d9488',
    border: 'border-teal-500/30',
  },
];

const CONTENT_TYPES = [
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'how_to', label: 'How-To Guide' },
  { value: 'faq', label: 'FAQ Page' },
  { value: 'comparison', label: 'Comparison Article' },
  { value: 'listicle', label: 'Listicle' },
];

interface ContentResult {
  title: string;
  meta_description: string;
  target_keyword: string;
  content_type: string;
  word_count: number;
  content: string;
  schema_markup: string;
  generated_at: string;
  site_url: string;
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-amber-400 font-bold text-base mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-amber-300 font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-white/70 ml-4 list-disc">{line.slice(2)}</li>;
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-white/70">{line}</p>;
      })}
    </div>
  );
}

export default function ContentPage() {
  const [url, setUrl] = useState('');
  const [website, setWebsite] = useState<{ id: string; domain: string; url?: string } | null>(null);
  const [queueItems, setQueueItems] = useState<Array<{ id: string; title: string; target_keyword: string; word_count: number; status: string; created_at: string; content?: string }>>([]);
  const [activeMainTab, setActiveMainTab] = useState<'generate' | 'queue'>('generate');
  const [previewItem, setPreviewItem] = useState<{ id: string; title: string; target_keyword: string; word_count: number; status: string; created_at: string; content?: string } | null>(null);

  const loadWebsiteAndQueue = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: ws } = await supabase.from('websites').select('id, domain, url').order('created_at', { ascending: true }).limit(1).single();
    if (ws) {
      setWebsite(ws);
      // Only pre-fill if the user hasn't already typed something (prevents concatenation bug)
      if (ws.url) setUrl((prev) => prev || ws.url!);
      const res = await fetch(`/api/content?websiteId=${ws.id}`);
      const data = await res.json();
      setQueueItems(data.items || []);
    } else if (user) {
      // Fallback: pre-fill from users.website_url (only if empty)
      const { data: profile } = await supabase.from('users').select('website_url').eq('id', user.id).single();
      if (profile?.website_url) setUrl((prev) => prev || profile.website_url);
    }
  }, []);

  useEffect(() => { loadWebsiteAndQueue(); }, [loadWebsiteAndQueue]);
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [wordCount, setWordCount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'schema'>('content');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, topic, keyword, niche, contentType, wordCount, websiteId: website?.id, saveToQueue: !!website?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Content generation failed');
      setResult(data);
      if (website?.id) await loadWebsiteAndQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateQueueStatus = async (id: string, status: string) => {
    await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    await loadWebsiteAndQueue();
    if (previewItem?.id === id) setPreviewItem(null);
  };

  const copyContent = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
  };

  const pendingCount = queueItems.filter(i => i.status === 'pending_approval').length;

  return (
    <div className="w-full space-y-6 relative">
      <style>{`@keyframes floatAgent{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-20" style={{ background: 'radial-gradient(circle,#d97706 0%,transparent 70%)', zIndex: 0 }} />

      {/* Header — left content + right avatar */}
      <div className="flex items-start gap-6 relative z-10">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Content Writer Agent</h1>
              <p className="text-white/50 text-sm mt-1">Generate full SEO + GEO optimized articles. Saved to your approval queue automatically.</p>
            </div>
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 flex-shrink-0">
              <button type="button" onClick={() => setActiveMainTab('generate')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeMainTab === 'generate' ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/60'}`}>Generate</button>
              <button type="button" onClick={() => setActiveMainTab('queue')} className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeMainTab === 'queue' ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/60'}`}>
                Queue
                {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>}
              </button>
            </div>
          </div>

          {activeMainTab === 'queue' && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-white font-medium text-sm">Content Approval Queue</span>
                <span className="text-xs text-white/30">{queueItems.length} total</span>
              </div>
              {queueItems.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm">No content yet — generate your first article above</div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {queueItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{item.target_keyword} · {item.word_count?.toLocaleString()} words · {new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          item.status === 'published' ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : item.status === 'pending_approval' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-white/40 bg-white/5 border-white/10'
                        }`}>{item.status === 'pending_approval' ? 'Pending' : item.status}</span>
                        <button onClick={() => setPreviewItem(previewItem?.id === item.id ? null : item)} className="p-1.5 text-white/30 hover:text-white/60 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        {item.status === 'pending_approval' && (
                          <>
                            <button onClick={() => updateQueueStatus(item.id, 'published')} className="p-1.5 text-green-400/60 hover:text-green-400 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => updateQueueStatus(item.id, 'rejected')} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {previewItem && (
                <div className="border-t border-white/10 p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm font-medium">Preview: {previewItem.title}</span>
                    <button onClick={() => setPreviewItem(null)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
                  </div>
                  <MarkdownPreview content={previewItem.content || ''} />
                </div>
              )}
            </div>
          )}

          {activeMainTab === 'generate' && <form onSubmit={handleGenerate} className="bg-white/5 border border-amber-500/20 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Website URL (for context)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Article Topic <span className="text-amber-400">*</span></label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How to fix a leaking pipe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Target Keyword <span className="text-amber-400">*</span></label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. emergency plumber Dubai"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Your Business Niche <span className="text-amber-400">*</span></label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder={`e.g. "plumbing services", "women's fashion", "accounting software"`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <p className="text-xs text-white/30 mt-1">This ensures the article matches your industry — not a generic topic</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['SaaS / Software', 'E-commerce', 'Real Estate', 'Healthcare', 'Finance', 'Legal Services', 'Home Services', 'Digital Marketing', 'Education', 'Travel'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNiche(suggestion)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      niche === suggestion
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/30'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {topic && keyword && (
              <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3 text-sm">
                <p className="font-medium text-white/70 mb-2">Article Preview</p>
                <p className="text-white/50"><span className="text-white/30">Topic:</span> {topic}</p>
                <p className="text-white/50"><span className="text-white/30">Keyword:</span> {keyword}</p>
                <p className={niche ? 'text-white/50' : 'text-amber-400/70'}>
                  <span className="text-white/30">Niche:</span> {niche || '⚠️ Not specified — article may be off-topic'}
                </p>
                <p className="text-white/30 text-xs mt-1">Estimated length: 900–1,200 words · Includes FAQ + Schema markup</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#0a0a0f]">{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Word Count</label>
                <select
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                >
                  <option value={500} className="bg-[#0a0a0f]">~500 words</option>
                  <option value={800} className="bg-[#0a0a0f]">~800 words</option>
                  <option value={1000} className="bg-[#0a0a0f]">~1,000 words</option>
                  <option value={1500} className="bg-[#0a0a0f]">~1,500 words</option>
                  <option value={2000} className="bg-[#0a0a0f]">~2,000 words</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || (!url.trim() && !topic.trim())}
                className="flex items-center justify-center gap-2 px-7 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Writing...' : 'Generate Content'}
              </button>
            </div>

            {loading && (
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Researching topic and analysing competitors', delay: 0 },
                  { label: 'Building SEO-optimised outline', delay: 900 },
                  { label: 'Writing full article with keyword placement', delay: 2000 },
                  { label: 'Generating JSON-LD schema markup', delay: 4000 },
                ].map((step, i) => (
                  <ProgressStep key={i} label={step.label} delay={step.delay} />
                ))}
              </div>
            )}
          </form>}

          {activeMainTab === 'generate' && error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-amber-400/60" />
              </div>
              <p className="text-white/40 text-sm font-medium">Your generated content will appear here</p>
              <p className="text-white/25 text-xs max-w-xs">Enter your website URL and topic above. ContentAI will write a full SEO-optimized article and email it to you.</p>
            </div>
          )}
        </div>

        {/* Right: floating ContentAI avatar */}
        <div className="hidden md:flex flex-col items-center justify-start pt-2 flex-shrink-0 w-52">
          <div style={{ animation: 'floatAgent 3s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(217,119,6,0.5))' }}>
            <Image src="/agent-contentai-transparent.png" alt="ContentAI" width={200} height={200} className="w-44 h-44 object-contain" />
          </div>
          <span className="text-sm font-semibold text-amber-300 mt-2">ContentAI</span>
          <span className="text-xs text-white/40">Content Writer Agent</span>
        </div>
      </div>

      {/* Results (full width below) */}
      {result && (
        <div className="space-y-4 relative z-10">
          <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 text-sm font-medium">Content Generated &amp; Emailed to You</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 truncate">{result.title}</h2>
                <p className="text-white/50 text-sm">{result.meta_description}</p>
                <div className="flex gap-6 mt-3">
                  <div>
                    <div className="text-lg font-bold text-amber-400">{result.word_count}</div>
                    <div className="text-xs text-white/40">Words</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{result.target_keyword}</div>
                    <div className="text-xs text-white/40">Target Keyword</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white capitalize">{result.content_type.replace('_', ' ')}</div>
                    <div className="text-xs text-white/40">Type</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={copyContent} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-all">
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadContent} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-xl transition-all">
                  <Download className="w-4 h-4" />
                  Download .md
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <FileText className="w-4 h-4 inline mr-1.5" />Article Content
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'schema' ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <Code2 className="w-4 h-4 inline mr-1.5" />JSON-LD Schema
            </button>
          </div>

          {activeTab === 'content' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <MarkdownPreview content={result.content} />
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
              <p className="text-white/50 text-xs mb-3">Copy this JSON-LD and add it to your page&apos;s &lt;head&gt; tag for AI search engine visibility.</p>
              <pre className="text-emerald-400 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {result.schema_markup}
              </pre>
            </div>
          )}
        {/* What's Next? */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-1">What&apos;s Next?</h3>
          <p className="text-sm text-white/40 mb-4">Keep the momentum going — run another agent</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {WHATS_NEXT_CONTENT.map((agent) => (
              <Link
                key={agent.name}
                href={agent.href}
                className={`group flex items-center gap-4 p-4 bg-white/5 border ${agent.border} rounded-xl hover:bg-white/10 transition-all cursor-pointer`}
              >
                <Image src={agent.avatar} alt={agent.name} width={44} height={44} className="w-11 h-11 object-contain flex-shrink-0" style={{ filter: `drop-shadow(0 0 8px ${agent.glow})` }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{agent.name}</div>
                  <div className="text-xs text-white/40 mt-0.5 leading-snug">{agent.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 text-white/30 group-hover:text-white transition-colors" style={{ color: agent.color }} />
              </Link>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
