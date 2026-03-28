const BASE_URL = 'https://api.dataforseo.com/v3';

function getAuth(): string | null {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;
  return Buffer.from(`${login}:${password}`).toString('base64');
}

export interface KeywordData {
  volume: number;
  cpc: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  updatedAt: string;
}

export async function fetchKeywordVolumes(
  keywords: string[]
): Promise<Record<string, KeywordData>> {
  const auth = getAuth();
  if (!auth) return {};

  try {
    const response = await fetch(
      `${BASE_URL}/keywords_data/google_ads/search_volume/live`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keywords,
            location_code: 2840, // United States
            language_code: 'en',
          },
        ]),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) return {};

    const data = await response.json();
    const result: Record<string, KeywordData> = {};

    for (const item of data?.tasks?.[0]?.result || []) {
      result[item.keyword] = {
        volume: item.search_volume ?? 0,
        cpc: item.cpc ?? 0,
        competition: item.competition_level ?? 'LOW',
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }

    return result;
  } catch {
    return {};
  }
}

export async function fetchKeywordSuggestions(
  seedKeyword: string,
  limit = 15
): Promise<
  Array<{
    keyword: string;
    volume: number;
    cpc: number;
    competition: 'LOW' | 'MEDIUM' | 'HIGH';
  }>
> {
  const auth = getAuth();
  if (!auth) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/dataforseo_labs/google/keyword_suggestions/live`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keyword: seedKeyword,
            location_code: 2840,
            language_code: 'en',
            limit,
            include_seed_keyword: true,
            filters: ['keyword_info.search_volume', '>', 100],
          },
        ]),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const items = data?.tasks?.[0]?.result?.[0]?.items || [];

    return items.map(
      (item: {
        keyword_data: {
          keyword: string;
          keyword_info: {
            search_volume: number;
            cpc: number;
            competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
          };
        };
      }) => ({
        keyword: item.keyword_data.keyword,
        volume: item.keyword_data.keyword_info?.search_volume ?? 0,
        cpc: item.keyword_data.keyword_info?.cpc ?? 0,
        competition: item.keyword_data.keyword_info?.competition_level ?? 'LOW',
      })
    );
  } catch {
    return [];
  }
}
