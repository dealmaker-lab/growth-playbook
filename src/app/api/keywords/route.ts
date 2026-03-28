import { createSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return Response.json({ error: 'category parameter required' }, { status: 400 });
  }

  const categoryMap: Record<string, string> = {
    Gaming: 'calculator-gaming',
    'E-commerce': 'calculator-ecommerce',
    FinTech: 'calculator-fintech',
    'Health & Fitness': 'calculator-health',
    Utility: 'calculator-utility',
  };

  const dbCategory = categoryMap[category];
  if (!dbCategory) {
    return Response.json({ error: 'Invalid category' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('playbook_keyword_cache')
    .select('keyword, volume, cpc, competition, opportunity, updated_at')
    .eq('category', dbCategory)
    .order('volume', { ascending: false })
    .limit(15);

  if (error) {
    return Response.json({ keywords: [] });
  }

  return Response.json(
    { keywords: data || [] },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    }
  );
}
