// POST /admin/api/journal/:id/publish — gated on excerpt + cover(+alt) + SEO desc.
import { requireApiMutation } from '@/lib/admin/guard'
import { publishJournalPost } from '@/lib/admin/journal-db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { id } = await params
  const r = await publishJournalPost(id, g.session.user.id)
  if (!r.ok) return jsonError(422, r.reason)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
