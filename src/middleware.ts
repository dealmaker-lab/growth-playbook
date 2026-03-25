import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const unlocked = request.cookies.get('playbook_unlocked')?.value === '1';
  response.headers.set('x-playbook-unlocked', unlocked ? '1' : '0');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|assets|api).*)'],
};
