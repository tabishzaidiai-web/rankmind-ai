import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes — redirect unauthenticated users to login
  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('message', 'Sign in to access your agent dashboard');
    return NextResponse.redirect(loginUrl);
  }

  // For authenticated users on dashboard routes (except onboarding itself)
  if (user && pathname.startsWith('/dashboard') && pathname !== '/dashboard/onboarding') {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    // If no profile row or onboarding not completed, redirect to onboarding
    if (!profile || profile.onboarding_completed === false) {
      const onboardingUrl = new URL('/dashboard/onboarding', request.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    // Check onboarding status to decide where to send them
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();
    url.pathname = (!profile || !profile.onboarding_completed) ? '/dashboard/onboarding' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
