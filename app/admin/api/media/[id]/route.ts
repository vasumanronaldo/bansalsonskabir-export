// DELETE /admin/api/media/:id — media-library deletion. Blocks images that are
// still referenced by a live entity (409); otherwise soft-deletes the row and
// removes the R2 objects via the shared deleteImage helper (no second path).
import { requireApiMutation } from '@/lib/admin/guard'
import { deleteImage } from '@/lib/admin/images'
import { isImageInUse } from '@/lib/admin/media'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error
  const { id } = await params
  if (await isImageInUse(id)) {
    return jsonError(409, 'This image is in use. Remove it from the piece or post first.')
  }
  await deleteImage(id, guard.session.user.id)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
