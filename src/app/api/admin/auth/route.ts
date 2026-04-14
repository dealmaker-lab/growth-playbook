import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Admin dashboard auth endpoint.
 *
 * Protection: 10 attempts per hour per IP (independent scope).
 * Blocks offline-dictionary brute force against ADMIN_PASSWORD.
 */

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit brute-force attempts ──
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    const limit = rateLimit(ip, {
      scope: 'admin-auth',
      max: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
    });
    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    const body = await request.json();
    const password = body.password?.trim();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[admin/auth] ADMIN_PASSWORD env var is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', '1', {
      maxAge: 86400, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
