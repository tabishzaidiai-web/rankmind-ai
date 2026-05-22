'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Code, Copy, CheckCircle2, AlertCircle, Zap, ArrowRight, ExternalLink } from 'lucide-react';

interface SchemaResult {
  url: string;
  generated_at: string;
  page_type: string;
  schemas: Array<{
    type: string;
    priority: 'critical' | 'high' | 'medium';
    why_it_matters: string;
    ai_citation_impact: string;
    json_ld: string;
  }>;
  implementation_guide: string;
  expected_improvements: {
    rich_results: string[];
    ai_citation_boost: string;
    estimated_ctr_improvement: string;
  };
  validation_checklist: string[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
      {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
    </button>
  );
}

function SchemaCard({ schema }: { schema: SchemaResult['schemas'][0] }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColor = schema.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : schema.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  // Format JSON for display
  let formattedJson = schema.json_ld;
  try {
    const parsed = typeof schema.json_ld === 'string' ? JSON.parse(schema.json_ld) : schema.json_ld;
    formattedJson = JSON.stringify(parsed, null, 2);
  } catch {
    formattedJson = typeof schema.json_ld === 'object' ? JSON.stringify(schema.json_ld, null, 2) : schema.json_ld;
  }

  const scriptTag = `<script type="application/ld+json">\n${formattedJson}\n</script>`;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Code className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{schema.type}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor}`}>{schema.priority.toUpperCase()}</span>
            </div>
          </div>
          <CopyButton text={scriptTag} />
        </div>
        <p className="text-white/60 text-sm mb-2">{schema.why_it_matters}</p>
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-xs">{schema.ai_citation_impact}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-3 text-xs text-white/40 hover:text-white/70 transition-colors">
          <span className="flex items-center gap-2"><Code className="w-3.5 h-3.5" />View JSON-LD Code</span>
          <span>{expanded ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {expanded && (
          <div className="px-5 pb-5">
            <div className="relative">
              <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-green-300 overflow-x-auto max-h-80 font-mono leading-relaxed">
                {scriptTag}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={scriptTag} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SchemaGeneratorPage() {
  const [url, setUrl] = useState('');
  const [pageType, setPageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemaResult | null>(null);
  const [history, setHistory] = useState<SchemaResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/schema-generator').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setHistory(d);
    });
  }, []);

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/schema-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, pageType: pageType || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const allSchemas = result.schemas.map(s => {
      let json = s.json_ld;
      try { json = JSON.stringify(typeof s.json_ld === 'string' ? JSON.parse(s.json_ld) : s.json_ld, null, 2); } catch {}
      return `<script type="application/ld+json">\n${json}\n</script>`;
    }).join('\n\n');
    navigator.clipboard.writeText(allSchemas);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 relative flex-shrink-0">
          <Image src="/agent-rankbot-transparent.png" alt="SchemaBot" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Schema Markup Generator</h1>
          <p className="text-white/50 text-sm mt-0.5">Generate production-ready JSON-LD structured data to maximize AI citations and rich results</p>
        </div>
      </div>

      {/* Why Schema Matters */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { stat: '3x', label: 'more AI citations with FAQPage schema', color: 'text-violet-400' },
          { stat: '156%', label: 'higher AI Overview selection with structured data', color: 'text-cyan-400' },
          { stat: '35%', label: 'more organic clicks when cited in AI Overviews', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.stat}</div>
            <div className="text-white/50 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Generate Schema Markup</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Page URL to Analyze</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/your-page"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Page Type (optional — auto-detected if blank)</label>
            <select
              value={pageType}
              onChange={e => setPageType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50"
            >
              <option value="">Auto-detect</option>
              <option value="homepage">Homepage</option>
              <option value="blog-post">Blog Post / Article</option>
              <option value="product">Product Page</option>
              <option value="service">Service Page</option>
              <option value="faq">FAQ Page</option>
              <option value="how-to">How-To Guide</option>
              <option value="local-business">Local Business</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !url}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating schema markup...</> : <><Code className="w-4 h-4" />Generate Schema Markup</>}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">{result.schemas.length} Schema Types Generated</h2>
                <p className="text-white/40 text-sm mt-1">{result.url} — {result.page_type}</p>
              </div>
              <button onClick={copyAll} className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm rounded-xl transition-all">
                <Copy className="w-4 h-4" />Copy All
              </button>
            </div>

            {/* Expected Improvements */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-emerald-400 font-bold text-sm">{result.expected_improvements.ai_citation_boost}</div>
                <div className="text-white/40 text-xs mt-0.5">AI Citation Boost</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <div className="text-blue-400 font-bold text-sm">{result.expected_improvements.estimated_ctr_improvement}</div>
                <div className="text-white/40 text-xs mt-0.5">Est. CTR Improvement</div>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                <div className="text-violet-400 font-bold text-sm">{result.expected_improvements.rich_results.length} types</div>
                <div className="text-white/40 text-xs mt-0.5">Rich Results Enabled</div>
              </div>
            </div>

            {result.expected_improvements.rich_results.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.expected_improvements.rich_results.map((r, i) => (
                  <span key={i} className="text-xs bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-full">{r}</span>
                ))}
              </div>
            )}
          </div>

          {/* Schema Cards */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Generated Schema Markup</h2>
            {result.schemas.map((schema, i) => (
              <SchemaCard key={i} schema={schema} />
            ))}
          </div>

          {/* Implementation Guide */}
          {result.implementation_guide && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-violet-400" />Implementation Guide
              </h3>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{result.implementation_guide}</p>
            </div>
          )}

          {/* Validation Checklist */}
          {result.validation_checklist.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />Validation Checklist
              </h3>
              <div className="space-y-2">
                {result.validation_checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <div className="w-5 h-5 rounded border border-white/20 flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-xs text-violet-400 hover:text-violet-300">
                <ExternalLink className="w-3.5 h-3.5" />Test with Google Rich Results Tester
              </a>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {!result && history.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Generations</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => setResult(h)} className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/5 border border-white/[0.05] rounded-xl transition-all text-left">
                <div>
                  <div className="text-white/80 text-sm font-medium">{h.url}</div>
                  <div className="text-white/30 text-xs">{h.page_type} — {new Date(h.generated_at).toLocaleDateString()}</div>
                </div>
                <span className="text-xs text-violet-400">{h.schemas?.length || 0} schemas</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
