// POST /admin/api/journal — create a post (native form; CSRF from a field).
import { requireApiSession } from '@/lib/admin/guard'
import { timingSafeEqual } from '@/lib/admin/auth'
import { createJournalPost } from '@/lib/admin/journal-db'
import { seeOther } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const g = await requireApiSession(req)
  if ('error' in g) return g.error
  const form = await req.formData()
  if (!timingSafeEqual(String(form.get('csrf') ?? ''), g.session.csrf)) return new Response('Bad CSRF token', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  const title = String(form.get('title') ?? '').trim()
  if (!title) return seeOther('/admin/journal/new?error=title')
  const id = await createJournalPost(g.session.user.id, title)
  return seeOther(`/admin/journal/${id}`)
}
