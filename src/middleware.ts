import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_PAGE_SESSION_TIMEOUT_MS = 4000;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public pages do not need a session refresh. Avoiding the Supabase
  // network call here keeps the landing page available if Supabase is slow.
  const needsAuthCheck =
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/signup';

  if (!needsAuthCheck) return NextResponse.next();

  // /login and /signup only use the session to send already-signed-in users
  // on to their dashboard. If Supabase is slow (e.g. refreshing an expired
  // session cookie), don't let that convenience block the page until the
  // platform times out with a 504 — show the page and let the client handle
  // sign-in. /dashboard keeps waiting: it must not open without a session.
  if (pathname === '/login' || pathname === '/signup') {
    const timedOut = Symbol('timeout');
    const result = await Promise.race([
      updateSession(request).catch(() => null),
      new Promise<typeof timedOut>((resolve) => setTimeout(() => resolve(timedOut), AUTH_PAGE_SESSION_TIMEOUT_MS)),
    ]);
    if (result === timedOut || result === null) return NextResponse.next();
    return result;
  }

  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
