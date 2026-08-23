// POST /admin/api/login/2fa — second login step. Requires the signed handoff
// cookie from the password step plus a valid TOTP code. Rate limited on the same
// counter as passwords. Only here is the real session minted.
import { adminEnv } from '@/lib/admin/session'
import { createSession, isRateLimited, recordAttempt } from '@/lib/admin/auth'
import { readPendingCookie, verifyUserTotp, clearPendingCookie } from '@/lib/admin/twofa-db'
import { seeOther } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const env = adminEnv()
  const ip = req.headers.get('CF-Connecting-IP') ?? ''

  const userId = await readPendingCookie(env, req)
  if (!userId) return seeOther('/admin/login/2fa?error=expired', clearPendingCookie)

  if (await isRateLimited(env, userId, ip)) return seeOther('/admin/login?error=rate')

  const form = await req.formData()
  const code = String(form.get('code') ?? '')

  const ok = await verifyUserTotp(env, userId, code)
  await recordAttempt(env, userId, ip, ok)
  if (!ok) return seeOther('/admin/login/2fa?error=1')

  const user = await env.DB.prepare('SELECT must_change FROM users WHERE id = ? AND disabled = 0').bind(userId).first<{ must_change: number }>()
  if (!user) return seeOther('/admin/login?error=1')

  const { cookie } = await createSession(env, userId, req)
  await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(userId).run()
  // Clear the handoff cookie and set the real session in one response.
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  headers.append('Set-Cookie', clearPendingCookie)
  headers.append('Set-Cookie', cookie)
  headers.set('Location', user.must_change === 1 ? '/admin/password' : '/admin')
  return new Response(null, { status: 303, headers })
}
