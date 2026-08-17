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

export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  for (const [k, v] of Object.entries(ADMIN_HEADERS)) {
    if (k.toLowerCase() === 'content-security-policy') continue // replaced below
    res.headers.set(k, v)
  }
  res.headers.set('Content-Security-Policy', CSP)
  return res
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
