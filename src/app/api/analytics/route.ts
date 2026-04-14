import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Public analytics ingestion endpoint.
 *
 * Protections:
 *   - 10 KB body cap (reject oversized payloads before JSON parsing)
 *   - Zod schema validation (session_id, event_type, section, metadata)
 *   - Per-IP rate limit (200 events / 15 min) to block spam while allowing
 *     a realistic reading session (page_view + scroll + section_view + cta clicks).
 */

const MAX_BODY_BYTES = 10 * 1024; // 10 KB

// Whitelist for event_type: lowercase a-z, digits, underscore, 1-64 chars
const eventTypeRegex = /^[a-z][a-z0-9_]{0,63}$/;
// session_id: alphanumeric + dashes, 8-64 chars
const sessionIdRegex = /^[A-Za-z0-9_-]{8,64}$/;

const analyticsSchema = z.object({
  session_id: z.string().regex(sessionIdRegex, 'Invalid session_id'),
  event_type: z.string().regex(eventTypeRegex, 'Invalid event_type'),
  section: z.string().max(64).optional().nullable(),
  metadata: z.record(z.string().max(64), z.unknown()).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit by IP (independent scope from /api/unlock) ──
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    const limit = rateLimit(ip, {
      scope: 'analytics',
      max: 200,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    // ── Reject oversized payloads via Content-Length header ──
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 }
      );
    }

    // ── Read raw body, double-check actual size, then parse ──
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 }
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // ── Zod validation ──
    const parsed = analyticsSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { session_id, event_type, section, metadata } = parsed.data;

    const supabase = createSupabaseAdmin();
    const { error: dbError } = await supabase
      .from('playbook_analytics')
      .insert({
        session_id,
        event_type,
        section: section ?? null,
        metadata: metadata ?? null,
      });

    if (dbError) {
      console.error('[analytics] Supabase insert error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to record event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[analytics] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
