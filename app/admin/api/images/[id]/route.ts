// PATCH /admin/api/images/:id — alt text / cover flag.
// DELETE /admin/api/images/:id — soft delete the row + delete the R2 objects.
import { requireApiMutation } from '@/lib/admin/guard'
import { updateImage, deleteImage } from '@/lib/admin/images'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const ok = () => new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  const body = (await req.json().catch(() => null)) as { alt?: string; is_cover?: boolean } | null
  if (!body) return jsonError(400, 'Missing body')
  await updateImage(id, body, guard.session.user.id)
  return ok()
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  await deleteImage(id, guard.session.user.id)
  return ok()
}
