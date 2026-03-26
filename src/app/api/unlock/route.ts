import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.de',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
  'tempail.com',
  'temp-mail.org',
  '10minutemail.com',
  'mailnesia.com',
  'getairmail.com',
  'mohmal.com',
  'getnada.com',
  'emailondeck.com',
  'burnermail.io',
  'inboxkitten.com',
  'mailsac.com',
  'harakirimail.com',
  'tmail.ws',
  'tmpmail.net',
  'tmpmail.org',
  'bupmail.com',
  'mailtemp.org',
  'emailfake.com',
  'crazymailing.com',
  'armyspy.com',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
];

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit by IP ──
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    const limit = rateLimit(ip);
    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': '900' },
        }
      );
    }

    // ── Parse body ──
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // ── Validate email format ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ── Check disposable domains ──
    const domain = email.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { success: false, error: 'Please use a work email address' },
        { status: 400 }
      );
    }

    // ── Extract metadata from body ──
    const utm_source = body.utm_source || null;
    const utm_medium = body.utm_medium || null;
    const utm_campaign = body.utm_campaign || null;
    const referrer = body.referrer || request.headers.get('referer') || null;
    const user_agent =
      body.user_agent || request.headers.get('user-agent') || null;

    // ── Upsert into Supabase ──
    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase.from('playbook_leads').upsert(
      {
        email,
        source: 'gate',
        ip_address: ip,
        user_agent,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (dbError) {
      console.error('[unlock] Supabase upsert error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // ── Fire Zapier webhook (fire-and-forget) ──
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (zapierUrl) {
      fetch(zapierUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          utm_source,
          utm_medium,
          utm_campaign,
          referrer,
          ip_address: ip,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error('[unlock] Zapier webhook failed:', err.message)
      );
    }

    // ── Set cookie: 90 days, HttpOnly, Secure, SameSite=Lax ──
    const response = NextResponse.json({ success: true });
    response.cookies.set('playbook_unlocked', '1', {
      maxAge: 60 * 60 * 24 * 90,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[unlock] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
