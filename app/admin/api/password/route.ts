// POST /admin/api/password — change your own password. Current password
// required; new password verified for length and confirmation; must_change
// cleared. CSRF from the session.
import { adminEnv } from '@/lib/admin/session'
import { getSession, verifyPassword, hashPassword, timingSafeEqual } from '@/lib/admin/auth'
import { seeOther } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const env = adminEnv()
  const session = await getSession(env, req)
  if (!session) return seeOther('/admin/login')

  const form = await req.formData()
  const csrf = String(form.get('csrf') ?? '')
  if (!csrf || !timingSafeEqual(csrf, session.csrf)) {
    return new Response('Bad CSRF token', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  const current = String(form.get('current') ?? '')
  const next = String(form.get('next') ?? '')
  const confirm = String(form.get('confirm') ?? '')

  if (next.length < 8) return seeOther('/admin/password?error=len')
  if (next !== confirm) return seeOther('/admin/password?error=match')

  const user = await env.DB.prepare('SELECT password_hash, password_salt FROM users WHERE id = ?')
    .bind(session.user.id)
    .first<{ password_hash: string; password_salt: string }>()
  if (!user || !(await verifyPassword(current, user.password_hash, user.password_salt))) {
    return seeOther('/admin/password?error=current')
  }

  const { hash, salt } = await hashPassword(next)
  await env.DB.prepare("UPDATE users SET password_hash = ?, password_salt = ?, must_change = 0 WHERE id = ?")
    .bind(hash, salt, session.user.id)
    .run()

  return seeOther('/admin')
}
