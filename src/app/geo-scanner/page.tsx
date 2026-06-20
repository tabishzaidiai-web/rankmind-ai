'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GEOScannerPage() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/geo-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keyword }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Visibility Scanner
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See if ChatGPT and Perplexity are citing your website or your competitors.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl mb-12">
          <form onSubmit={handleScan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Website URL</label>
                <input
                  type="text"
                  placeholder="example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Target Keyword (Optional)</label>
                <input
                  type="text"
                  placeholder="best seo tool 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scanning AI Search Engines...' : 'Scan Visibility Now →'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="text-sm text-slate-400 mb-1">Overall Visibility</div>
                <div className="text-4xl font-bold text-indigo-400">{result.overall_visibility}%</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="text-sm text-slate-400 mb-1">Perplexity Status</div>
                <div className={`text-xl font-bold ${result.perplexity_status === 'cited' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.perplexity_status.toUpperCase()}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="text-sm text-slate-400 mb-1">ChatGPT Status</div>
                <div className={`text-xl font-bold ${result.chatgpt_status === 'cited' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.chatgpt_status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> AI Reasoning
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                {result.reasoning}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Missing Elements</h4>
                  <ul className="space-y-2">
                    {result.missing_elements.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-red-400 mt-1">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Competitor Edge</h4>
                  <p className="text-slate-300">{result.competitor_edge}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-center shadow-2xl shadow-indigo-500/20">
              <h3 className="text-2xl font-bold mb-2">Fix Your AI Visibility Today</h3>
              <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
                RankBot can automatically inject the missing {result.missing_elements[0]} and optimize your site for AI citations in minutes.
              </p>
              <Link 
                href="/signup"
                className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-xl"
              >
                Deploy RankBot Now →
              </Link>
              <p className="mt-4 text-sm text-indigo-200">No credit card required • 10-factor full audit included</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
