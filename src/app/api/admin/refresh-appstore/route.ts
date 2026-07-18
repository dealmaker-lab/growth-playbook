import { cookies } from 'next/headers';
import { buildCategory, SEED_APPS, type Category } from '@/lib/appstore';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Refresh the App Store search-demand cache.
 *
 * Separate from /api/admin/refresh-keywords, which fills playbook_keyword_cache
 * with GOOGLE volumes for the playbook's own SEO terms. That job is still
 * legitimate for its own purpose; it just must never again be pointed at
 * anything labelled "App Store".
 *
 * Intended to run monthly. App Store volumes move slowly and the run is
 * deliberately slow anyway: brand classification calls Apple's public search
 * endpoint once per keyword at its ~20 req/min ceiling, so a full five-category
 * refresh takes roughly 15 minutes of mostly sleeping. `maxDuration` is set
 * accordingly; run one category at a time with ?category= if a platform limit
 * makes the full sweep impractical.
 */
export const maxDuration = 800;

const CATEGORIES = Object.keys(SEED_APPS) as Category[];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const adminPw = process.env.ADMIN_PASSWORD;

  if (session !== '1' && (!adminPw || body.password !== adminPw)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return Response.json({ error: 'DataForSEO credentials not configured' }, { status: 503 });
  }

  const only = typeof body.category === 'string' ? (body.category as Category) : null;
  if (only && !CATEGORIES.includes(only)) {
    return Response.json({ error: `Unknown category: ${only}` }, { status: 400 });
  }
  const targets = only ? [only] : CATEGORIES;

  const supabase = createSupabaseAdmin();
  const summary: Record<string, unknown> = {};

  for (const category of targets) {
    const rows = await buildCategory(category);
    if (rows.length === 0) {
      // Never wipe a good cache because an upstream call failed: leave the
      // previous rows in place and report it.
      summary[category] = { skipped: 'no rows returned; previous cache left intact' };
      continue;
    }

    const { error } = await supabase.from('appstore_keyword_cache').upsert(
      rows.map((r) => ({
        keyword: r.keyword,
        category,
        volume: r.volume,
        is_brand: r.isBrand,
        apps_ranking: r.appsRanking,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'category,keyword' },
    );

    const brand = rows.filter((r) => r.isBrand);
    const brandVol = brand.reduce((s, r) => s + r.volume, 0);
    const totalVol = rows.reduce((s, r) => s + r.volume, 0);
    summary[category] = error
      ? { error: error.message }
      : {
          keywords: rows.length,
          brand: brand.length,
          generic: rows.length - brand.length,
          brandSharePct: totalVol ? Math.round((brandVol / totalVol) * 100) : 0,
        };
  }

  return Response.json({ success: true, summary });
}
