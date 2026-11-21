import Link from 'next/link';

/** Pages worth linking to from page content. Labels follow each page's own title. */
export const PAGES = {
  'how-agents-work': 'How the agents work',
  geo: 'What is GEO? Generative Engine Optimization',
  'solo-founders': 'RankMind AI for solo founders',
  'small-agencies': 'RankMind AI for small agencies',
  comparison: 'RankMind AI vs Semrush',
  'free-audit': 'Free SEO audit',
  help: 'Help centre',
  about: 'About RankMind AI',
  contact: 'Contact us',
} as const;
export type PageKey = keyof typeof PAGES;

/** In-content related links: real <a href> links crawlers follow (unlike footer-only links). */
export default function RelatedLinks({ title = 'Learn more', pages }: { title?: string; pages: PageKey[] }) {
  return (
    <section aria-label={title} className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-lg font-semibold text-white/80 mb-3">{title}</h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {pages.map((k) => (
          <li key={k}>
            <Link href={`/${k}`} className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">
              {PAGES[k]} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
