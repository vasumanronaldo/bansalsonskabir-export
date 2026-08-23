// POST /admin/api/security — manage your own 2FA. Native form (works under the
// strict admin CSP): CSRF from the session, an `op` field selects the action.
import { adminEnv } from '@/lib/admin/session'
import { getSession, timingSafeEqual } from '@/lib/admin/auth'
import { beginEnrollment, confirmEnrollment, disableTwoFA } from '@/lib/admin/twofa-db'
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

  const op = String(form.get('op') ?? '')
  const uid = session.user.id

  if (op === 'begin') {
    await beginEnrollment(uid)
    return seeOther('/admin/security')
  }
  if (op === 'confirm') {
    const ok = await confirmEnrollment(uid, String(form.get('code') ?? ''))
    return seeOther(ok ? '/admin/security?ok=1' : '/admin/security?error=code')
  }
  if (op === 'disable') {
    await disableTwoFA(uid)
    return seeOther('/admin/security?off=1')
  }
  return seeOther('/admin/security')
}
