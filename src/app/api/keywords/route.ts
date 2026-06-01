import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPlanFromUser } from '@/lib/plan-middleware';

const DFS_LOGIN = process.env.DATAFORSEO_LOGIN || '';
const DFS_PASSWORD = process.env.DATAFORSEO_PASSWORD || '';

async function dfsRequest(endpoint: string, body: unknown) {
  const credentials = Buffer.from(`${DFS_LOGIN}:${DFS_PASSWORD}`).toString('base64');
  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DataForSEO error: ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Plan check: keywords limit ──
    const userPlan = getUserPlanFromUser(user);
    if (userPlan.limits.keywordsLimit === 0) {
      return NextResponse.json(
        {
          error: 'Keyword tracking requires the Starter plan or above.',
          upgradeRequired: true,
          currentPlan: userPlan.plan,
        },
        { status: 403 }
      );
    }

    const { websiteId, seeds, targetCountry = 'US', language = 'en' } = await req.json();
    if (!seeds || seeds.length === 0) {
      return NextResponse.json({ error: 'At least one seed keyword is required' }, { status: 400 });
    }

    // If DataForSEO not configured, return mock data
    if (!DFS_LOGIN || !DFS_PASSWORD) {
      const mockKeywords = seeds.flatMap((seed: string) => [
        { keyword: seed, search_volume: Math.floor(Math.random() * 5000) + 100, difficulty: Math.floor(Math.random() * 70) + 10, cpc: (Math.random() * 3).toFixed(2), search_intent: 'commercial', type: 'primary' },
        { keyword: `best ${seed}`, search_volume: Math.floor(Math.random() * 2000) + 50, difficulty: Math.floor(Math.random() * 60) + 10, cpc: (Math.random() * 2).toFixed(2), search_intent: 'commercial', type: 'secondary' },
        { keyword: `${seed} guide`, search_volume: Math.floor(Math.random() * 1500) + 30, difficulty: Math.floor(Math.random() * 50) + 5, cpc: (Math.random() * 1.5).toFixed(2), search_intent: 'informational', type: 'longtail' },
        { keyword: `how to use ${seed}`, search_volume: Math.floor(Math.random() * 800) + 20, difficulty: Math.floor(Math.random() * 40) + 5, cpc: (Math.random() * 1).toFixed(2), search_intent: 'informational', type: 'longtail' },
        { keyword: `${seed} for small business`, search_volume: Math.floor(Math.random() * 600) + 10, difficulty: Math.floor(Math.random() * 35) + 5, cpc: (Math.random() * 2).toFixed(2), search_intent: 'commercial', type: 'supporting' },
      ]);

      // Save to DB if websiteId provided
      if (websiteId) {
        const rows = mockKeywords.map((kw: { keyword: string; search_volume: number; difficulty: number; cpc: string; search_intent: string; type: string }) => ({
          website_id: websiteId,
          keyword: kw.keyword,
          type: kw.type,
          search_volume: kw.search_volume,
          difficulty: kw.difficulty,
          cpc: parseFloat(kw.cpc),
          search_intent: kw.search_intent,
          target_country: targetCountry,
        }));
        // Upsert (skip duplicates)
        await supabase.from('keywords').upsert(rows, { onConflict: 'website_id,keyword' });
      }

      return NextResponse.json({ keywords: mockKeywords, source: 'mock' });
    }

    // Real DataForSEO call
    const locationCode = getLocationCode(targetCountry);
    const languageCode = getLanguageCode(language);

    const data = await dfsRequest('keywords_data/google_ads/keywords_for_keywords/live', [
      {
        keywords: seeds,
        location_code: locationCode,
        language_code: languageCode,
        include_serp_info: true,
      },
    ]);

    const rawItems = data?.tasks?.[0]?.result?.[0]?.items || [];
    const keywords = rawItems.slice(0, 50).map((item: {
      keyword: string;
      search_volume?: number;
      keyword_difficulty?: number;
      cpc?: number;
      search_intent?: string;
    }, i: number) => ({
      keyword: item.keyword,
      search_volume: item.search_volume || 0,
      difficulty: item.keyword_difficulty || 0,
      cpc: item.cpc || 0,
      search_intent: item.search_intent || 'informational',
      type: i === 0 ? 'primary' : i < 4 ? 'secondary' : i < 15 ? 'supporting' : 'longtail',
    }));

    // Save to DB
    if (websiteId && keywords.length > 0) {
      const rows = keywords.map((kw: { keyword: string; type: string; search_volume: number; difficulty: number; cpc: number; search_intent: string }) => ({
        website_id: websiteId,
        keyword: kw.keyword,
        type: kw.type,
        search_volume: kw.search_volume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        search_intent: kw.search_intent,
        target_country: targetCountry,
      }));
      await supabase.from('keywords').upsert(rows, { onConflict: 'website_id,keyword' });
    }

    return NextResponse.json({ keywords, source: 'dataforseo' });
  } catch (error) {
    console.error('[Keywords API]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function getLocationCode(country: string): number {
  const map: Record<string, number> = {
    'United States': 2840, 'United Kingdom': 2826, 'Canada': 2124,
    'Australia': 2036, 'Germany': 2276, 'France': 2250, 'India': 2356,
    'Brazil': 2076, 'Spain': 2724, 'Italy': 2380, 'Netherlands': 2528,
    'Singapore': 2702, 'UAE': 2784, 'South Africa': 2710, 'Nigeria': 2566,
  };
  return map[country] || 2840;
}

function getLanguageCode(language: string): string {
  const map: Record<string, string> = {
    'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
    'Portuguese': 'pt', 'Italian': 'it', 'Dutch': 'nl', 'Arabic': 'ar',
    'Hindi': 'hi', 'Japanese': 'ja', 'Korean': 'ko', 'Mandarin': 'zh',
  };
  return map[language] || 'en';
}
