import { cookies } from 'next/headers';
import { buildCategory, SEED_APPS, type Category } from '@/lib/appstore';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Refresh the App Store search-demand cache for ONE category.
 *
 * Separate from /api/admin/refresh-keywords, which fills playbook_keyword_cache
 * with Google volumes for the playbook's own SEO terms. That job is still
 * legitimate for its own purpose; it just must never again be pointed at
 * anything labelled "App Store".
 *
 * ONE CATEGORY PER INVOCATION, deliberately. Brand classification calls Apple's
 * public search endpoint once per candidate at its ~20 req/min ceiling, so a
 * category takes 4-5 minutes and all five take about twenty. Vercel caps a
 * function at 800s even on Pro, so a single all-categories run would be killed
 * part-way and leave the cache half-updated. The cron in vercel.json therefore
 * fires five times, one category each, spaced an hour apart.
 *
 * Auth, either:
 *   - Vercel Cron: Authorization: Bearer $CRON_SECRET
 *   - a human: admin_session cookie, or {password} in the body
 */
export const runtime = 'nodejs';
export const maxDuration = 800;

const CATEGORIES = Object.keys(SEED_APPS) as Category[];

function authorised(request: Request, body: Record<string, unknown>, session?: string): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization');
  // Length-independent compare is unnecessary here (the secret is not derived
  // from user input) but an exact match is required.
  if (cronSecret && header === `Bearer ${cronSecret}`) return true;
  if (session === '1') return true;
  const adminPw = process.env.ADMIN_PASSWORD;
  return !!adminPw && body.password === adminPw;
}

async function refresh(category: Category) {
  const rows = await buildCategory(category);
  if (rows.length === 0) {
    // Never wipe a good cache because an upstream call failed: leave the
    // previous rows alone and report it.
    return { category, skipped: 'no rows returned; previous cache left intact' };
  }

  const supabase = createSupabaseAdmin();
  // Replace rather than upsert: the relevance gate rejects terms that were
  // stored by an earlier, looser run, and an upsert would leave them behind.
  const { error: delErr } = await supabase.from('appstore_keyword_cache').delete().eq('category', category);
  if (delErr) return { category, error: `delete: ${delErr.message}` };

  const { error } = await supabase.from('appstore_keyword_cache').insert(
    rows.map((r) => ({
      keyword: r.keyword,
      category,
      volume: r.volume,
      is_brand: r.isBrand,
      apps_ranking: r.appsRanking,
      updated_at: new Date().toISOString(),
    })),
  );
  if (error) return { category, error: error.message };

  const brand = rows.filter((r) => r.isBrand);
  const brandVol = brand.reduce((s, r) => s + r.volume, 0);
  const totalVol = rows.reduce((s, r) => s + r.volume, 0);
  return {
    category,
    keywords: rows.length,
    brand: brand.length,
    generic: rows.length - brand.length,
    brandSharePct: totalVol ? Math.round((brandVol / totalVol) * 100) : 0,
  };
}

/** Vercel Cron issues GET. Category comes from the query string. */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!authorised(request, {}, cookieStore.get('admin_session')?.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const category = new URL(request.url).searchParams.get('category') as Category | null;
  if (!category || !CATEGORIES.includes(category)) {
    return Response.json({ error: `category must be one of: ${CATEGORIES.join(', ')}` }, { status: 400 });
  }
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return Response.json({ error: 'DataForSEO credentials not configured' }, { status: 503 });
  }
  return Response.json({ success: true, result: await refresh(category) });
}

/** Manual runs from the admin UI. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!authorised(request, body, cookieStore.get('admin_session')?.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const category = body.category as Category | undefined;
  if (!category || !CATEGORIES.includes(category)) {
    return Response.json({ error: `category must be one of: ${CATEGORIES.join(', ')}` }, { status: 400 });
  }
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return Response.json({ error: 'DataForSEO credentials not configured' }, { status: 503 });
  }
  return Response.json({ success: true, result: await refresh(category) });
}
