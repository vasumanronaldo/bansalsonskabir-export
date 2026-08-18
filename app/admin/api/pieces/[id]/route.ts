// PATCH /admin/api/pieces/:id — save edits with optimistic concurrency.
// DELETE /admin/api/pieces/:id — soft delete.
import { requireApiMutation } from '@/lib/admin/guard'
import { updatePiece, softDeletePiece } from '@/lib/admin/db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  const body = (await req.json().catch(() => null)) as
    | { name?: string; subtitle?: string; collection_id?: string | null; description?: string; featured?: boolean; updatedAt?: string }
    | null
  if (!body || typeof body.name !== 'string' || !body.updatedAt) return jsonError(400, 'Missing fields')

  const result = await updatePiece(
    id,
    body.updatedAt,
    {
      name: body.name,
      subtitle: body.subtitle ?? '',
      collection_id: body.collection_id ?? null,
      description: body.description ?? '',
      featured: body.featured ? 1 : 0,
    },
    guard.session.user.id,
  )
  if (!result.ok) {
    return json({ conflict: true, updatedBy: result.updatedBy, updatedAt: result.updatedAt }, 409)
  }
  return json({ ok: true, updatedAt: result.updatedAt })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  await softDeletePiece(id, guard.session.user.id)
  return json({ ok: true })
}
