import { createSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * App Store search demand for one calculator category.
 *
 * Reads appstore_keyword_cache, which holds genuine App Store search volume
 * (DataForSEO Labs, se_type "apple"). Distinct from /api/keywords, which serves
 * playbook_keyword_cache and is GOOGLE web-search volume. Keeping them on
 * separate routes and separate tables is deliberate: conflating the two is what
 * produced a widget that claimed App Store data while showing Google numbers.
 *
 * Returns the two halves already split, plus the volume share, so the client
 * does no arithmetic it could get wrong and the numbers on screen always agree
 * with the rows beneath them.
 */

const CATEGORIES = new Set(['Gaming', 'E-commerce', 'FinTech', 'Health & Fitness', 'Utility']);

const empty = () =>
  Response.json({ brand: [], generic: [], brandShare: 0, total: 0, updatedAt: null }, { headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get('category');
  // Unknown category is not an error for a marketing widget: hide, don't shout.
  if (!category || !CATEGORIES.has(category)) return empty();

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('appstore_keyword_cache')
    .select('keyword, volume, is_brand, updated_at')
    .eq('category', category)
    .order('volume', { ascending: false })
    .limit(50);

  if (error || !data?.length) return empty();

  const brand = data.filter((r) => r.is_brand);
  const generic = data.filter((r) => !r.is_brand);
  const brandVol = brand.reduce((s, r) => s + r.volume, 0);
  const totalVol = data.reduce((s, r) => s + r.volume, 0);

  return Response.json(
    {
      // Only the top few are rendered, but the SHARE is computed across all 50
      // so it describes the category rather than the slice on screen.
      brand: brand.slice(0, 6).map(({ keyword, volume }) => ({ keyword, volume })),
      generic: generic.slice(0, 6).map(({ keyword, volume }) => ({ keyword, volume })),
      brandCount: brand.length,
      genericCount: generic.length,
      brandShare: totalVol ? Math.round((brandVol / totalVol) * 100) : 0,
      total: data.length,
      updatedAt: data[0]?.updated_at ?? null,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' } },
  );
}
