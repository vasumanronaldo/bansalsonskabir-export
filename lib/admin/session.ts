import 'server-only'
// Session helpers for the admin portal. Bridges Next (next/headers, redirect)
// to the raw-Request auth primitives in ./auth, and reads the Cloudflare
// bindings (D1, SESSION_PEPPER) via OpenNext's getCloudflareContext.
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from './auth'

export function adminEnv(): CloudflareEnv {
  return getCloudflareContext().env
}

/** Read + validate the session from the incoming cookie (server components). */
export async function currentSession() {
  const cookie = (await headers()).get('cookie') ?? ''
  const req = new Request('https://admin.local/', { headers: { cookie } })
  return getSession(adminEnv(), req)
}

/** Redirects to /admin/login when there is no valid session. */
export async function requireSession() {
  const s = await currentSession()
  if (!s) redirect('/admin/login')
  return s
}

/** Owner-only. Editors are bounced to the dashboard. */
export async function requireOwner() {
  const s = await requireSession()
  if (s.user.role !== 'owner') redirect('/admin')
  return s
}

/** must_change gate — call from the dashboard so a first login is forced to /admin/password. */
export async function mustChangePassword(userId: string): Promise<boolean> {
  const row = await adminEnv().DB.prepare('SELECT must_change FROM users WHERE id = ?').bind(userId).first<{ must_change: number }>()
  return row?.must_change === 1
}
