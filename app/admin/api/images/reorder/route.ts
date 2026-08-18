// POST /admin/api/images/reorder — { pieceId, ids: [] } in the new order.
import { requireApiMutation } from '@/lib/admin/guard'
import { reorderImages } from '@/lib/admin/images'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const body = (await req.json().catch(() => null)) as { pieceId?: string; ids?: string[] } | null
  if (!body?.pieceId || !Array.isArray(body.ids)) return jsonError(400, 'Missing fields')
  await reorderImages(body.pieceId, body.ids, guard.session.user.id)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
