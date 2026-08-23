// POST /admin/api/login — plain form POST (no client JS, so it works under the
// strict admin CSP). Rate limited. Unknown email and wrong password return the
// SAME redirect and take the SAME time (dummyVerify on the miss path). On
// success, rotates a fresh session cookie and forces /admin/password when the
// account is still on its one-time password.
import { adminEnv } from '@/lib/admin/session'
import { verifyPassword, dummyVerify, createSession, isRateLimited, recordAttempt } from '@/lib/admin/auth'
import { isTwoFAEnabled, makePendingCookie } from '@/lib/admin/twofa-db'
import { seeOther } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const env = adminEnv()
  const ip = req.headers.get('CF-Connecting-IP') ?? ''
  const form = await req.formData()
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  const identifier = email.toLowerCase()

  if (await isRateLimited(env, identifier, ip)) {
    return seeOther('/admin/login?error=rate')
  }

  const user = await env.DB.prepare(
    'SELECT id, password_hash, password_salt, disabled, must_change FROM users WHERE email = ? COLLATE NOCASE',
  )
    .bind(identifier)
    .first<{ id: string; password_hash: string; password_salt: string; disabled: number; must_change: number }>()

  let ok = false
  if (user && !user.disabled) {
    ok = await verifyPassword(password, user.password_hash, user.password_salt)
  } else {
    await dummyVerify() // equal timing for unknown / disabled accounts
  }
  await recordAttempt(env, identifier, ip, ok)

  if (!ok || !user) return seeOther('/admin/login?error=1')

  // Password is correct. If the account has 2FA, hand off to the code step with a
  // short-lived signed cookie — no real session exists until the code checks out.
  if (await isTwoFAEnabled(env, user.id)) {
    const pending = await makePendingCookie(env, user.id)
    return seeOther('/admin/login/2fa', pending)
  }

  const { cookie } = await createSession(env, user.id, req)
  await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run()
  return seeOther(user.must_change === 1 ? '/admin/password' : '/admin', cookie)
}
