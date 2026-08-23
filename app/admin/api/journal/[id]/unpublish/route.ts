// POST /admin/api/journal/:id/unpublish
import { requireApiMutation } from '@/lib/admin/guard'
import { unpublishJournalPost } from '@/lib/admin/journal-db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { id } = await params
  await unpublishJournalPost(id, g.session.user.id)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
