import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_HEADERS } from '@/lib/admin/auth'

// Hardened headers on every /admin response. The CSP allows same-origin scripts
// and inline (Next streams page markup via framework inline scripts; a per-request
// nonce is not reliably propagated to the renderer on OpenNext/Workers, which left
// the page blank). It still blocks all external/third-party scripts, framing and
// plugins — the meaningful protections for an internal admin surface.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ')

function withHeaders(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(ADMIN_HEADERS)) {
    if (k.toLowerCase() === 'content-security-policy') continue // replaced below
    res.headers.set(k, v)
  }
  res.headers.set('Content-Security-Policy', CSP)
  return res
}

// The admin's own entry points, reachable without a session.
const PUBLIC = new Set(['/admin/login', '/admin/login/2fa', '/admin/api/login', '/admin/api/login/2fa'])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Defence in depth (audit Q3): block any /admin request that carries no session
  // cookie at all before it reaches the page/route. Per-route guards still perform
  // the real cryptographic session validation.
  if (pathname.startsWith('/admin') && !PUBLIC.has(pathname) && !req.cookies.get('bsj_session')) {
    if (pathname.startsWith('/admin/api')) {
      return withHeaders(new NextResponse(JSON.stringify({ error: 'Not signed in' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return withHeaders(NextResponse.redirect(url, 302))
  }

  return withHeaders(NextResponse.next())
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
