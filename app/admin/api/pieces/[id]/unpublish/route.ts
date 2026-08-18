// POST /admin/api/pieces/:id/unpublish
import { requireApiMutation } from '@/lib/admin/guard'
import { unpublishPiece } from '@/lib/admin/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  await unpublishPiece(id, guard.session.user.id)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
