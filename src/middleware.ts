import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public pages do not need a session refresh. Avoiding the Supabase
  // network call here keeps the landing page available if Supabase is slow.
  const needsAuthCheck =
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/signup';

  if (!needsAuthCheck) return NextResponse.next();

  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
