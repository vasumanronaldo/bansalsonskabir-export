// POST /admin/api/pieces/:id/publish — 422 if any image lacks alt text.
import { requireApiMutation } from '@/lib/admin/guard'
import { publishPiece } from '@/lib/admin/db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  const result = await publishPiece(id, guard.session.user.id)
  if (!result.ok) return jsonError(422, result.reason)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
