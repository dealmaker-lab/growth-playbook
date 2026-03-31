import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * ML Foundations: Dynamic Content Ranking by Engagement
 *
 * Queries playbook_analytics for section_view events, ranks chapters
 * by real engagement data, and returns an ordered list.
 *
 * Ranking algorithm:
 * - Score = view_count * 0.4 + avg_scroll_depth * 0.3 + unique_sessions * 0.3
 * - Normalized to 0-100 scale
 * - Falls back to default order when insufficient data (<10 total events)
 */

interface SectionRanking {
  section: string;
  label: string;
  score: number;
  viewCount: number;
  uniqueSessions: number;
  avgScrollDepth: number;
}

const SECTION_LABELS: Record<string, string> = {
  'ch1-dsp': 'Programmatic DSP Engine',
  'ch2-rewarded': 'Rewarded Models',
  'ch3-oem': 'OEM & On-Device Discovery',
  'ch4-asa': 'ASA/ASO Synergy',
};

const DEFAULT_ORDER = ['ch1-dsp', 'ch2-rewarded', 'ch3-oem', 'ch4-asa'];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ rankings: defaultRankings(), source: 'default' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query section_view events from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from('playbook_analytics')
      .select('section, session_id, metadata')
      .eq('event_type', 'section_view')
      .gte('created_at', thirtyDaysAgo)
      .not('section', 'is', null);

    if (error || !events || events.length < 10) {
      return NextResponse.json({
        rankings: defaultRankings(),
        source: 'default',
        eventCount: events?.length ?? 0,
      });
    }

    // Aggregate per section
    const stats: Record<string, { views: number; sessions: Set<string>; scrollDepths: number[] }> = {};

    for (const section of DEFAULT_ORDER) {
      stats[section] = { views: 0, sessions: new Set(), scrollDepths: [] };
    }

    for (const event of events) {
      const section = event.section as string;
      if (!stats[section]) continue;

      stats[section].views += 1;
      stats[section].sessions.add(event.session_id as string);

      // Extract scroll_depth from metadata if available
      const meta = event.metadata as Record<string, unknown> | null;
      if (meta?.scroll_depth && typeof meta.scroll_depth === 'number') {
        stats[section].scrollDepths.push(meta.scroll_depth);
      }
    }

    // Compute raw scores
    const rawScores: { section: string; raw: number; views: number; sessions: number; avgScroll: number }[] = [];

    for (const section of DEFAULT_ORDER) {
      const s = stats[section];
      const avgScroll = s.scrollDepths.length > 0
        ? s.scrollDepths.reduce((a, b) => a + b, 0) / s.scrollDepths.length
        : 50; // default 50% if no scroll data

      const raw = s.views * 0.4 + avgScroll * 0.3 + s.sessions.size * 0.3;
      rawScores.push({
        section,
        raw,
        views: s.views,
        sessions: s.sessions.size,
        avgScroll: Math.round(avgScroll),
      });
    }

    // Normalize to 0-100
    const maxRaw = Math.max(...rawScores.map((r) => r.raw), 1);
    const rankings: SectionRanking[] = rawScores
      .map((r) => ({
        section: r.section,
        label: SECTION_LABELS[r.section] || r.section,
        score: Math.round((r.raw / maxRaw) * 100),
        viewCount: r.views,
        uniqueSessions: r.sessions,
        avgScrollDepth: r.avgScroll,
      }))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      rankings,
      source: 'analytics',
      eventCount: events.length,
      period: '30d',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch {
    return NextResponse.json({ rankings: defaultRankings(), source: 'default' });
  }
}

function defaultRankings(): SectionRanking[] {
  return DEFAULT_ORDER.map((section, i) => ({
    section,
    label: SECTION_LABELS[section] || section,
    score: 100 - i * 15,
    viewCount: 0,
    uniqueSessions: 0,
    avgScrollDepth: 0,
  }));
}
