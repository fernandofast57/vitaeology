import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Bypass auth in development
const isDevelopment = process.env.NODE_ENV === 'development'

// ============================================================================
// AFFILIATE TRACKING CONFIGURATION
// ============================================================================
const AFFILIATE_COOKIE_NAME = 'vitae_ref';
const AFFILIATE_COOKIE_DURATION_DAYS = 90;
const AFFILIATE_TRACKED_PATHS = ['/challenge', '/pricing', '/libro', '/'];
const AFFILIATE_REF_PATTERN = /^AFF-[A-Z0-9]{6}$/;

// Route protection configuration
const ROUTE_CONFIG = {
  // Public routes - no auth required
  public: ['/challenge', '/api/challenge', '/api/analytics/behavioral', '/libro', '/og'],

  // Auth required routes
  protected: ['/dashboard', '/test', '/results', '/exercises', '/settings', '/profile', '/progress', '/subscription', '/assessment'],

  // Admin required routes (role_level >= 80 or is_admin = true)
  admin: ['/admin'],

  // Auth redirect routes (redirect to dashboard if logged in)
  authRedirect: ['/auth/login', '/auth/signup'],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // =========================================================================
  // AFFILIATE TRACKING - Prima di tutto, gestisci il cookie affiliato
  // =========================================================================
  const { searchParams, pathname } = request.nextUrl;
  const refCode = searchParams.get('ref');

  if (refCode && AFFILIATE_TRACKED_PATHS.some(path => pathname.startsWith(path) || pathname === '/')) {
    const existingCookie = request.cookies.get(AFFILIATE_COOKIE_NAME);

    // Solo se non esiste già un cookie e il formato è valido
    if (!existingCookie && AFFILIATE_REF_PATTERN.test(refCode)) {
      const expires = new Date();
      expires.setDate(expires.getDate() + AFFILIATE_COOKIE_DURATION_DAYS);

      supabaseResponse.cookies.set(AFFILIATE_COOKIE_NAME, refCode, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      // Fire and forget: traccia il click in background
      const trackUrl = new URL('/api/affiliate/track', request.url);
      fetch(trackUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'click',
          ref_code: refCode,
          landing_page: pathname,
          challenge_type: extractChallengeType(pathname),
          user_agent: request.headers.get('user-agent') || '',
          referrer: request.headers.get('referer') || ''
        })
      }).catch(err => {
        console.error('Errore tracking affiliato:', err);
      });
    }
  }

  // In development, bypassa completamente il controllo auth
  if (isDevelopment) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - important for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect logic
  const path = request.nextUrl.pathname

  // 1. Public routes - skip auth check completely
  const isPublicRoute = ROUTE_CONFIG.public.some(route => path.startsWith(route))
  if (isPublicRoute) {
    return supabaseResponse
  }

  // 2. Auth redirect routes - redirect to dashboard if already authenticated
  const isAuthRoute = ROUTE_CONFIG.authRedirect.some(route => path.startsWith(route))
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Protected routes - redirect to login if not authenticated
  const isProtectedRoute = ROUTE_CONFIG.protected.some(route => path.startsWith(route))
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // 4. Admin routes - check admin access
  const isAdminRoute = ROUTE_CONFIG.admin.some(route => path.startsWith(route))
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    // Check admin status from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role_id, roles(level)')
      .eq('id', user.id)
      .single()

    const roleLevel = (profile?.roles as { level?: number })?.level ?? 0
    const isAdmin = profile?.is_admin === true || roleLevel >= 80

    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Estrae il tipo di challenge dal pathname
function extractChallengeType(pathname: string): string | null {
  const match = pathname.match(/\/challenge\/(leadership|ostacoli|microfelicita)/);
  return match ? match[1] : null;
}
