import { NextRequest, NextResponse } from 'next/server'

// Cheap, edge-safe gate: only checks the session cookie is present, not that
// it's still valid — real verification (src/lib/auth/session.ts#getSession)
// happens server-side in each protected layout/route, which is also where
// role-based redirects (dealer vs OEM admin) live.
const SESSION_COOKIE = 'portal_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  // Public marketing site + application intake: the homepage, the apply
  // wizard, and account creation must be reachable by anonymous visitors —
  // that's the whole point of the landing page. Everything else (dealer
  // dashboard, OEM dashboard, stage/onboarding APIs) stays behind login.
  const publicExact = pathname === '/' || pathname === '/apply' || pathname === '/signup'
  const isPublicRoute =
    publicExact ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/apply') ||
    pathname.startsWith('/api/enquiry') ||
    pathname.startsWith('/api/auth')

  if (!hasSession && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSession && (pathname === '/login' || pathname === '/register' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
