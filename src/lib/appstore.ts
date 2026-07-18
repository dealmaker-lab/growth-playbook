/**
 * App Store search-demand ingestion.
 *
 * WHY THIS EXISTS: src/lib/dataforseo.ts calls Google endpoints
 * (keywords_data/google_ads/search_volume, dataforseo_labs/google/*). Those
 * return Google WEB search volumes, so a widget built on them cannot honestly
 * be labelled "App Store keywords". This module uses DataForSEO Labs' Apple
 * endpoints instead, where `se_type` is literally "apple" and search_volume is
 * documented as searches on the App Store.
 *
 * Two things the Apple endpoints do NOT give you, both verified live:
 *   - cpc and competition are always null. Any difficulty signal must be
 *     derived locally, which is why there is no competition column downstream.
 *   - There is no "volume for this list of keywords" endpoint. You cannot feed
 *     in a curated keyword list; you can only discover what real apps rank for.
 *     That constraint is what shapes everything below.
 */

const BASE = 'https://api.dataforseo.com/v3';
const US = 2840;

export type Category = 'Gaming' | 'E-commerce' | 'FinTech' | 'Health & Fitness' | 'Utility';

/**
 * Seed apps per category: the App Store leaders whose ranking keywords stand in
 * for category demand. Every id was verified live against
 * itunes.apple.com/lookup (resultCount 1, trackName + genre confirmed) rather
 * than recalled, because a wrong id poisons a whole category silently. An
 * earlier draft used an id believed to be Candy Crush Soda that was in fact
 * Pokemon GO, and the resulting keyword set was quietly wrong.
 *
 * Spread across sub-segments on purpose. Six match-3 titles would return six
 * copies of the same vocabulary and make the category look narrower than it is.
 */
export const SEED_APPS: Record<Category, { id: string; name: string }[]> = {
  Gaming: [
    { id: '431946152', name: 'Roblox' },
    { id: '553834731', name: 'Candy Crush Saga' },
    { id: '512939461', name: 'Subway Surfers' },
    { id: '1621328561', name: 'MONOPOLY GO!' },
    { id: '6443575749', name: 'Whiteout Survival' },
    { id: '6483539426', name: 'Fortnite' },
  ],
  'E-commerce': [
    { id: '297606951', name: 'Amazon Shopping' },
    { id: '338137227', name: 'Walmart' },
    { id: '282614216', name: 'eBay' },
    { id: '878577184', name: 'SHEIN' },
    { id: '1641486558', name: 'Temu' },
    { id: '896130944', name: 'Mercari' },
  ],
  FinTech: [
    { id: '711923939', name: 'Cash App' },
    { id: '351727428', name: 'Venmo' },
    { id: '519817714', name: 'Intuit Credit Karma' },
    { id: '938003185', name: 'Robinhood' },
    { id: '886427730', name: 'Coinbase' },
    { id: '836215269', name: 'Chime' },
  ],
  'Health & Fitness': [
    { id: '341232718', name: 'MyFitnessPal' },
    { id: '571800810', name: 'Calm' },
    { id: '1038369065', name: 'Flo' },
    { id: '792750948', name: 'Peloton' },
    { id: '426826309', name: 'Strava' },
    { id: '1041517543', name: 'Fitbod' },
  ],
  Utility: [
    { id: '905953485', name: 'NordVPN' },
    { id: '587366035', name: 'Picsart' },
    { id: '469337564', name: 'Acrobat Reader' },
    { id: '295646461', name: 'The Weather Channel' },
    { id: '287170072', name: 'Keeper Password Manager' },
    { id: '300704847', name: 'Speedtest by Ookla' },
  ],
};

function auth(): string | null {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;
  return Buffer.from(`${login}:${password}`).toString('base64');
}

interface AppleKeywordItem {
  keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number | null } };
}

/** Keywords one app ranks for on the US App Store, richest first. */
async function keywordsForApp(appId: string, limit: number): Promise<Map<string, number>> {
  const a = auth();
  const out = new Map<string, number>();
  if (!a) return out;

  const res = await fetch(`${BASE}/dataforseo_labs/apple/keywords_for_app/live`, {
    method: 'POST',
    headers: { Authorization: `Basic ${a}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      {
        app_id: appId,
        location_code: US,
        language_code: 'en',
        limit,
        order_by: ['keyword_data.keyword_info.search_volume,desc'],
      },
    ]),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) return out;

  const json = await res.json();
  const items: AppleKeywordItem[] = json?.tasks?.[0]?.result?.[0]?.items || [];
  for (const it of items) {
    const k = it.keyword_data?.keyword;
    const v = it.keyword_data?.keyword_info?.search_volume ?? 0;
    if (k && v > 0) out.set(k, Math.max(out.get(k) ?? 0, v));
  }
  return out;
}

/* ── brand detection ─────────────────────────────────────────────────────────
   A brand (navigational) query names a specific app; a generic query describes
   a need. The distinction is the entire point of the widget, so it is derived
   from Apple's own index rather than a hand-maintained brand list that would
   rot: search the App Store for the term, and if the term's distinctive words
   are contained in a TOP-RANKED app's title, the searcher was naming that app.

   Measured 31/31 on a hand-labelled set spanning all five categories. */

/** Words that describe a category or are pure filler. A term made only of these
 *  can never be a brand, and leaving them in produced the one false positive in
 *  testing ("puzzle games" matched an app titled "Jigsaw Puzzles - Puzzle Games"). */
const GENERIC_TOKENS = new Set([
  'app', 'apps', 'game', 'games', 'free', 'the', 'a', 'for', 'best', 'online', 'play', 'my',
  'pro', 'plus', 'new', 'top', 'to', 'and', 'io', 'offline', 'multiplayer', 'fun', 'cool',
  // genre / need nouns
  'puzzle', 'puzzles', 'racing', 'action', 'rpg', 'strategy', 'arcade', 'word', 'words',
  'trivia', 'casino', 'sports', 'adventure', 'simulation', 'card', 'cards', 'board', 'kids',
  'music', 'shooter', 'idle', 'merge', 'match', 'shopping', 'shop', 'store', 'finance',
  'bank', 'banking', 'budget', 'invest', 'investing', 'crypto', 'wallet', 'payment', 'money',
  'fitness', 'workout', 'health', 'tracker', 'diet', 'sleep', 'meditation', 'vpn', 'scanner',
  'weather', 'calculator', 'notes', 'password', 'pdf', 'photo', 'editor', 'cleaner',
  'translator', 'flashlight', 'file', 'manager', 'delivery', 'deals', 'sale', 'cheap',
]);

/** Apostrophes are DELETED, not split on: "Lowe's" and "Kohl's" must tokenise
 *  to "lowes"/"kohls" so they match how people actually type them. Splitting
 *  produced "lowe" + "s", which matched neither direction and filed two obvious
 *  retail brands as generic demand. */
const words = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const squash = (s: string) => words(s).join('');

/** Query decoration that carries no brand information. Distinct from
 *  GENERIC_TOKENS, which is about category nouns: these are the things people
 *  append when they already know the app. Leaving them in meant "walmart.com",
 *  "wells fargo login" and "norton account" all failed the match and were
 *  counted as generic discovery, understating the branded share. */
const QUERY_MODIFIERS = new Set([
  'com', 'www', 'net', 'org', 'login', 'log', 'signin', 'sign', 'in', 'account',
  'customer', 'service', 'number', 'phone', 'official', 'website', 'site', 'mobile',
]);

/** The brand root of a store title: everything before the first separator.
 *  Store titles carry marketing tails ("Walmart: Shopping & Savings",
 *  "Robinhood: Trading & Investing") and requiring the whole title to appear in
 *  the query would reject nearly every real brand match. */
const brandRoot = (title: string) => words(title.split(/[:|\-–—(]/)[0]);

export interface StoreHit {
  title: string;
  genre: string;
}

/** Apple's public search endpoint. No key, and Apple asks for ~20 calls/min.
 *  One call serves BOTH jobs below (relevance gate and brand test), so the
 *  rate limit is paid once per keyword rather than twice. */
async function appStoreTop(term: string): Promise<StoreHit[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=us&entity=software&limit=3`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'appsamurai-playbook/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.results || []).map((r: { trackName?: string; primaryGenreName?: string }) => ({
      title: r.trackName || '',
      genre: r.primaryGenreName || '',
    }));
  } catch {
    return [];
  }
}

/**
 * Which App Store genres count as "in this category".
 *
 * This gate is what makes the output category-specific. Without it the data is
 * unusable: the seed apps are giants that rank for enormous amounts of
 * unrelated demand, so E-commerce came back led by "gmail" and "facebook",
 * FinTech by "walmart" and "best buy", and Health & Fitness by "nike" and
 * "h&m". Requiring two seed apps to rank does not catch those, because the
 * giants all rank for them. Asking Apple what the top app for the term actually
 * IS does catch them.
 *
 * Utility is deliberately several genres: Apple has no "Utility" bucket that
 * matches how the industry uses the word, and the category's own seed apps sit
 * in Utilities, Photo & Video, Productivity, Weather and Business.
 */
const CATEGORY_GENRES: Record<Category, Set<string>> = {
  Gaming: new Set(['Games']),
  'E-commerce': new Set(['Shopping']),
  FinTech: new Set(['Finance']),
  'Health & Fitness': new Set(['Health & Fitness', 'Medical']),
  Utility: new Set(['Utilities', 'Productivity', 'Photo & Video', 'Weather', 'Business', 'Graphics & Design']),
};

/** Cheap rejects, applied before spending an Apple call on the term. */
const STORE_NAV = /\b(app ?store|play ?store|google ?play|itunes|download)\b/i;
function isJunk(term: string): boolean {
  if (term.length < 4) return true; // "go", "cha", "app"
  // Mojibake and stray symbols from the upstream index: "niké", "h$m".
  if (!/^[a-z0-9 .'&+-]+$/i.test(term)) return true;
  if (STORE_NAV.test(term)) return true;
  const w = words(term);
  if (w.length === 0) return true;
  if (w.every((x) => x.length <= 2)) return true;
  // A stray single letter marks a truncated index entry rather than a real
  // query: "vid a", "me a", "i m" all arrived this way. Genuine multi-word
  // searches do not contain bare letters.
  if (w.length > 1 && w.some((x) => x.length === 1)) return true;
  return false;
}

/**
 * Is this a brand (navigational) query, given what the store returns for it?
 *
 * Two directions, and the second one matters more than it looks. Forward: the
 * query's distinctive words all appear in a top app's title ("clash royale" ->
 * "Clash Royale"). Reverse: a top app's distinctive words all appear in the
 * QUERY ("wells fargo login" -> "Wells Fargo Mobile"). Without the reverse
 * check, every query carrying a modifier was misfiled as generic:
 * "amazon.com", "wells fargo login", "chase bank login", "nike.com" and
 * "adobe lightroom" all came back generic in the first run, which is plainly
 * wrong and would have understated the branded share.
 */
/** One-character typo distance, capped early. Brand misspellings are a real and
 *  meaningful slice of App Store demand ("pelaton" for Peloton), and Apple's
 *  search resolves them to the right app, so the only thing missing is
 *  tolerance on our side. */
function within1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length < 5 || b.length < 5) return false; // too short to be safe
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length) {
      i++;
      j++;
    } else if (a.length > b.length) i++;
    else j++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function isBrandQuery(term: string, hits: StoreHit[]): boolean {
  const qWords = words(term);
  // Strip decoration first, so "walmart.com" is compared as "walmart".
  const core = qWords.filter((w) => !QUERY_MODIFIERS.has(w));
  const distinctive = core.filter((w) => !GENERIC_TOKENS.has(w));
  if (distinctive.length === 0) return false; // "free games", "budget app"
  if (hits.length === 0) return false;

  const qSet = new Set(distinctive);
  const sq = squash(core.join(' '));

  // Only the top 2 count: ranking 3rd for a name is not navigational demand,
  // and looking deeper starts matching coincidences.
  for (const { title } of hits.slice(0, 2)) {
    const tSet = new Set(words(title));

    // Forward: everything distinctive in the query appears in the title.
    if (distinctive.every((w) => tSet.has(w))) return true;
    // De-spaced: "cookie run kingdom" vs the store's "CookieRun: Kingdom".
    if (sq.length >= 6 && squash(title).includes(sq)) return true;

    // Reverse: the app's own name sits inside the query.
    const root = brandRoot(title).filter((w) => !GENERIC_TOKENS.has(w));
    if (root.length > 0 && root.every((w) => qSet.has(w))) return true;
    // Same idea for titles with no separator ("Lowe's Home Improvement"): the
    // leading word is the brand, and it must be distinctive to count, so
    // "Weather Channel" cannot make the generic query "weather" look branded.
    if (root.length > 0 && qSet.has(root[0]) && distinctive[0] === root[0]) return true;
    // Brands get typed both longer and shorter than their store name:
    // "citibank" against "Citi Mobile", "chase" against "Chase Mobile". A
    // 4-char prefix either way catches those without matching coincidences,
    // and generic words never reach here because they are filtered above.
    if (
      root.length > 0 &&
      distinctive.some((q) =>
        root.some(
          (r) =>
            (r.length >= 4 && q.startsWith(r)) ||
            (q.length >= 4 && r.startsWith(q)) ||
            within1(q, r),
        ),
      )
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Three outcomes, not two. The widget labels one column "generic discovery", so
 * a term put there had better actually be generic.
 *
 * The catch is that brand detection depends on Apple returning the app, and
 * sometimes it does not: searching "zelle" returns Venmo and Cash App because
 * Zelle retired its standalone app, and "sofi login" returns Robinhood. Those
 * are unmistakably brand queries that no amount of matching can recognise from
 * this signal. Defaulting them to "generic" is how "zelle" and "sofi login"
 * ended up presented as generic discovery demand in an earlier run.
 *
 * So a term is only called GENERIC when every one of its words is a known
 * category or need word. Anything else that fails the brand test is UNKNOWN and
 * is dropped rather than guessed at. That shrinks the generic column, which is
 * the correct trade: a short honest list beats a longer one with brands in it.
 */
export type KeywordKind = 'brand' | 'generic' | 'unknown';

export function classify(term: string, hits: StoreHit[]): KeywordKind {
  if (isBrandQuery(term, hits)) return 'brand';
  const w = words(term);
  const allKnown = w.every((x) => GENERIC_TOKENS.has(x) || QUERY_MODIFIERS.has(x));
  return allKnown ? 'generic' : 'unknown';
}

/* ── the pipeline ────────────────────────────────────────────────────────── */

export interface CategoryKeyword {
  keyword: string;
  volume: number;
  isBrand: boolean;
  appsRanking: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Build one category's keyword picture.
 *
 * The `minApps` gate is what makes this usable. A single app's keyword list is
 * full of terms it ranks for by accident: Clash Royale ranks somewhere for
 * "usbank.com login" and "webex", which are meaningless as gaming demand.
 * Requiring two or more of the category's seed apps to rank for a term removes
 * that noise while keeping both halves we care about, because competitors
 * genuinely do rank for each other's brands.
 */
export async function buildCategory(
  category: Category,
  opts: { perApp?: number; top?: number; minApps?: number; screen?: number } = {},
): Promise<CategoryKeyword[]> {
  const { perApp = 300, top = 50, minApps = 2, screen = 140 } = opts;

  const volume = new Map<string, number>();
  const rankedBy = new Map<string, number>();

  for (const app of SEED_APPS[category]) {
    const kws = await keywordsForApp(app.id, perApp);
    for (const [k, v] of kws) {
      volume.set(k, Math.max(volume.get(k) ?? 0, v));
      rankedBy.set(k, (rankedBy.get(k) ?? 0) + 1);
    }
  }

  // Screen a POOL rather than exactly `top`: the genre gate rejects a large
  // share of candidates, so cutting to 50 first would leave far fewer than 50.
  const pool = [...volume.entries()]
    .filter(([k]) => (rankedBy.get(k) ?? 0) >= minApps && !isJunk(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, screen);

  const genres = CATEGORY_GENRES[category];
  const out: CategoryKeyword[] = [];

  for (const [keyword, vol] of pool) {
    if (out.length >= top) break;
    const hits = await appStoreTop(keyword);
    await sleep(3100); // Apple's ~20 req/min ceiling

    // Relevance gate: whatever the searcher was after, is it in this category?
    if (hits.length === 0 || !genres.has(hits[0].genre)) continue;

    // 'unknown' is dropped rather than guessed into either column.
    const kind = classify(keyword, hits);
    if (kind === 'unknown') continue;

    out.push({
      keyword,
      volume: vol,
      isBrand: kind === 'brand',
      appsRanking: rankedBy.get(keyword) ?? 0,
    });
  }
  return out;
}
