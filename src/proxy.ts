import { NextRequest, NextResponse } from 'next/server'

// Cheap, edge-safe gate: only checks the CRM's dealer_session cookie is
// present (it's a host-only "localhost" cookie, so the browser sends it to
// this app on :3001 too, even though the CRM API that issued it is on
// :4000). Real verification happens on every CRM API call this app makes —
// this middleware just avoids flashing the dashboard shell before redirecting.
const SESSION_COOKIE = 'dealer_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (pathname === '/dashboard' && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/signup') && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/login', '/signup'],
}
