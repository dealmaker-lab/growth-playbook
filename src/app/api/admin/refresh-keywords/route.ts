import { cookies } from 'next/headers';
import { fetchKeywordVolumes } from '@/lib/dataforseo';
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

const CALCULATOR_KEYWORDS: Record<string, string[]> = {
  gaming: [
    'mobile game', 'puzzle games free', 'idle tycoon game', 'racing game multiplayer',
    'match 3 games', 'strategy war game', 'casual games offline', 'action rpg mobile',
    'hypercasual game', 'word puzzle game', 'merge game', 'tower defense game',
    'simulation game mobile', 'card game app', 'arcade game free',
  ],
  ecommerce: [
    'shopping app', 'online shopping deals', 'fashion shopping app', 'grocery delivery app',
    'coupon app', 'flash sale app', 'price comparison app', 'marketplace app',
    'secondhand shopping app', 'luxury shopping app', 'cashback shopping',
    'buy now pay later app', 'daily deals app', 'wholesale app', 'thrift store app',
  ],
  fintech: [
    'finance app', 'investment app', 'stock trading app', 'crypto wallet app',
    'budget tracker app', 'banking app', 'payment app', 'money transfer app',
    'credit score app', 'tax filing app', 'savings app', 'insurance app',
    'loan calculator app', 'expense tracker', 'digital wallet',
  ],
  health: [
    'fitness app', 'workout app', 'meditation app', 'calorie counter app',
    'step counter app', 'yoga app', 'running tracker app', 'sleep tracker app',
    'mental health app', 'diet plan app', 'home workout app', 'health tracker',
    'water reminder app', 'period tracker app', 'nutrition app',
  ],
  utility: [
    'vpn app', 'file manager app', 'qr code scanner app', 'weather app',
    'calculator app', 'notes app', 'password manager app', 'pdf reader app',
    'photo editor app', 'screen recorder app', 'battery saver app', 'cleaner app',
    'wifi analyzer app', 'flashlight app', 'translator app',
  ],
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

  // 2. Fetch calculator keyword volumes per category (using search_volume endpoint)
  const calculatorData: Record<string, Record<string, { volume: number; cpc: number; competition: string }>> = {};
  for (const [category, keywords] of Object.entries(CALCULATOR_KEYWORDS)) {
    const volumes = await fetchKeywordVolumes(keywords);
    calculatorData[category] = volumes;
    results[`calculator_${category}`] = { count: Object.keys(volumes).length };
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
  for (const [category, volumes] of Object.entries(calculatorData)) {
    for (const [keyword, data] of Object.entries(volumes)) {
      const opportunity = deriveOpportunity(data.volume, data.competition);
      await supabase
        .from('playbook_keyword_cache')
        .upsert(
          {
            keyword,
            category: `calculator-${category}`,
            volume: data.volume,
            cpc: data.cpc,
            competition: data.competition,
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
