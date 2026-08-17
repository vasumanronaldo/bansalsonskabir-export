import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_HEADERS } from '@/lib/admin/auth'

// Every /admin response carries the hardened headers (no-store, DENY frames,
// nosniff, noindex, strict CSP). Session validation itself happens in the pages
// (requireSession) and API routes; this guarantees the headers regardless.
export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  for (const [k, v] of Object.entries(ADMIN_HEADERS)) res.headers.set(k, v)
  return res
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
