// POST /admin/api/pieces — create a piece (native form from /admin/pieces/new,
// so CSRF comes from a form field, not the header). Slug is generated from the
// name and frozen. Redirects into the editor.
import { requireApiSession } from '@/lib/admin/guard'
import { timingSafeEqual } from '@/lib/admin/auth'
import { createPiece } from '@/lib/admin/db'
import { seeOther } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const guard = await requireApiSession(req)
  if ('error' in guard) return guard.error
  const form = await req.formData()
  const csrf = String(form.get('csrf') ?? '')
  if (!timingSafeEqual(csrf, guard.session.csrf)) return new Response('Bad CSRF token', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  const name = String(form.get('name') ?? '').trim()
  if (!name) return seeOther('/admin/pieces/new?error=name')
  const id = await createPiece(guard.session.user.id, name)
  return seeOther(`/admin/pieces/${id}`)
}
