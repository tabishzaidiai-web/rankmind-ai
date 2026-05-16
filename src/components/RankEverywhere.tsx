'use client';

const platforms = [
  {
    name: 'Google Search',
    label: 'Search Engine',
    color: '#4285F4',
    bg: 'from-blue-600/20 to-blue-800/10',
    border: 'border-blue-500/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: 'Google AI Overviews',
    label: 'AI Overview',
    color: '#34A853',
    bg: 'from-green-600/20 to-green-800/10',
    border: 'border-green-500/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <circle cx="12" cy="12" r="10" fill="url(#gai)" />
        <defs>
          <radialGradient id="gai" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="50%" stopColor="#34A853" />
            <stop offset="100%" stopColor="#FBBC05" />
          </radialGradient>
        </defs>
        <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'ChatGPT',
    label: 'AI Chatbot',
    color: '#10A37F',
    bg: 'from-emerald-600/20 to-emerald-800/10',
    border: 'border-emerald-500/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#10A37F">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
  {
    name: 'Perplexity AI',
    label: 'AI Chatbot',
    color: '#20B2AA',
    bg: 'from-teal-600/20 to-teal-800/10',
    border: 'border-teal-500/30',
    icon: (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
        <span className="text-white font-black text-sm">P</span>
      </div>
    ),
  },
  {
    name: 'Microsoft Copilot',
    label: 'AI Chatbot',
    color: '#0078D4',
    bg: 'from-blue-700/20 to-blue-900/10',
    border: 'border-blue-600/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <rect x="2" y="2" width="9" height="9" rx="1.5" fill="#F25022"/>
        <rect x="13" y="2" width="9" height="9" rx="1.5" fill="#7FBA00"/>
        <rect x="2" y="13" width="9" height="9" rx="1.5" fill="#00A4EF"/>
        <rect x="13" y="13" width="9" height="9" rx="1.5" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    name: 'Gemini',
    label: 'AI Chatbot',
    color: '#8B5CF6',
    bg: 'from-violet-600/20 to-violet-800/10',
    border: 'border-violet-500/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#gem)"/>
        <defs>
          <linearGradient id="gem" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="100%" stopColor="#8B5CF6"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Bing Search',
    label: 'Search Engine',
    color: '#008272',
    bg: 'from-cyan-700/20 to-cyan-900/10',
    border: 'border-cyan-600/30',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#008272">
        <path d="M5 3v15.26l3.18 1.83 8.31-4.79-3.22-1.86-.01-3.6 5.93 3.42L9.18 19.5 5 17.1V3H5zm4.18 7.33l.01 2.17 1.82 1.05-1.83-3.22z"/>
      </svg>
    ),
  },
  {
    name: 'Claude',
    label: 'AI Chatbot',
    color: '#D97706',
    bg: 'from-amber-600/20 to-amber-800/10',
    border: 'border-amber-500/30',
    icon: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
        <span className="text-white font-black text-sm">C</span>
      </div>
    ),
  },
];

export default function RankEverywhere() {
  return (
    <section className="py-20 px-6" id="rank-everywhere">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Rank on Every Platform That Matters
        </h2>
        <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
          Modern SEO isn&apos;t just Google. Your customers are searching everywhere.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {platforms.map(p => (
            <div
              key={p.name}
              className={`bg-gradient-to-br ${p.bg} border ${p.border} rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-200`}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                {p.icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-xs text-white/50 mt-0.5">{p.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/50 text-sm mb-6">
          RankMind AI optimises your content to appear across all of these — automatically.
        </p>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
        >
          See How It Works →
        </a>
      </div>
    </section>
  );
}
