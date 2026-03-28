import { cookies } from 'next/headers';
import { fetchKeywordVolumes, fetchKeywordSuggestions } from '@/lib/dataforseo';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

const PLAYBOOK_KEYWORDS = [
  'rewarded playtime', 'mobile user acquisition', 'programmatic mobile advertising',
  'mobile DSP', 'OEM user acquisition', 'app store optimization', 'apple search ads',
  'mobile app retargeting', 'offerwall monetization', 'mobile ad creative',
  'incrementality testing mobile', 'custom product pages', 'SKAN attribution',
  'mobile gaming UA', 'rewarded ads', 'pre-loaded app installs',
  'mobile app LTV', 'CPI mobile advertising', 'demand side platform mobile',
  'app store keyword optimization', 'mobile growth strategy 2026',
  'programmatic ROAS', 'mobile ad fraud prevention', 'in-app advertising',
  'mobile attribution', 'deep linking mobile apps', 'mobile retargeting strategy',
  'app install campaigns', 'mobile programmatic buying', 'rewarded video ads',
  'OEM advertising mobile', 'apple search ads optimization', 'ASO keyword research',
  'app store ranking factors', 'mobile UA cost benchmarks', 'CPI by country mobile',
  'mobile gaming monetization', 'casual game user acquisition', 'hypercasual game marketing',
  'mobile ad creatives', 'playable ads mobile', 'endcard optimization',
  'mobile DSP vs social ads', 'app store custom product pages', 'mobile growth playbook',
  'UA channel mix strategy', 'mobile advertising ROI', 'cross-channel mobile marketing',
];

const CALCULATOR_SEEDS: Record<string, string[]> = {
  gaming: ['mobile game', 'puzzle game app', 'idle game', 'strategy game app', 'racing game app'],
  ecommerce: ['shopping app', 'ecommerce app', 'deals app', 'online shopping'],
  fintech: ['finance app', 'investment app', 'banking app', 'payment app'],
  health: ['fitness app', 'health tracker', 'workout app', 'meditation app'],
  utility: ['utility app', 'productivity app', 'vpn app', 'file manager app'],
};

export async function POST(request: Request) {
  // Auth check — try cookie first, then request body password
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const adminPw = process.env.ADMIN_PASSWORD;

  if (session !== '1' && (!adminPw || body.password !== adminPw)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // 1. Fetch playbook keyword volumes
  const playbookData = await fetchKeywordVolumes(PLAYBOOK_KEYWORDS);
  results.playbook = { count: Object.keys(playbookData).length };

  // 2. Fetch calculator keyword suggestions per category
  const calculatorData: Record<string, unknown[]> = {};
  for (const [category, seeds] of Object.entries(CALCULATOR_SEEDS)) {
    const categoryResults: unknown[] = [];
    for (const seed of seeds) {
      const suggestions = await fetchKeywordSuggestions(seed, 5);
      categoryResults.push(...suggestions);
    }
    calculatorData[category] = categoryResults;
    results[`calculator_${category}`] = { count: categoryResults.length };
  }

  // 3. Store in Supabase
  const supabase = createSupabaseAdmin();

  // Upsert playbook keywords
  for (const [keyword, data] of Object.entries(playbookData)) {
    await supabase
      .from('playbook_keyword_cache')
      .upsert(
        {
          keyword,
          category: 'playbook',
          volume: data.volume,
          cpc: data.cpc,
          competition: data.competition,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'keyword' }
      );
  }

  // Upsert calculator keywords
  for (const [category, keywords] of Object.entries(calculatorData)) {
    for (const kw of keywords as Array<{ keyword: string; volume: number; cpc: number; competition: string }>) {
      const opportunity = deriveOpportunity(kw.volume, kw.competition);
      await supabase
        .from('playbook_keyword_cache')
        .upsert(
          {
            keyword: kw.keyword,
            category: `calculator-${category}`,
            volume: kw.volume,
            cpc: kw.cpc,
            competition: kw.competition,
            opportunity,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'keyword' }
        );
    }
  }

  return Response.json({
    success: true,
    results,
    message: 'Keywords refreshed successfully',
  });
}

function deriveOpportunity(volume: number, competition: string): string {
  if (volume >= 10000 && competition === 'LOW') return 'Hidden Gem';
  if (volume >= 10000 && competition === 'HIGH') return 'Brand Defense';
  if (volume < 5000 && competition === 'LOW') return 'Long-tail Win';
  return 'Discovery';
}
