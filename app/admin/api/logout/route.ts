// POST /admin/logout — deletes the session row and clears the cookie. CSRF
// token (from the session) required as a form field.
import { adminEnv } from '@/lib/admin/session'
import { getSession, timingSafeEqual, clearCookie } from '@/lib/admin/auth'
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

  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(session.sessionId).run()
  return seeOther('/admin/login', clearCookie)
}
