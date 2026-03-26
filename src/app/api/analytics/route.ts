import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { session_id, event_type, section, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json(
        { success: false, error: 'session_id and event_type are required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('playbook_analytics')
      .insert({
        session_id,
        event_type,
        section: section || null,
        metadata: metadata || null,
      });

    if (dbError) {
      console.error('[analytics] Supabase insert error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to record event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
