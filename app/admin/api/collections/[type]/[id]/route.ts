// PATCH /admin/api/collections/:type/:id — update. DELETE — remove.
import { requireApiMutation } from '@/lib/admin/guard'
import { updateRow, deleteRow, collection } from '@/lib/admin/collection-db'
import { COLLECTIONS } from '@/lib/admin/collections'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ type: string; id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { type, id } = await params
  if (!(type in COLLECTIONS)) return jsonError(404, 'Unknown collection')
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return jsonError(400, 'Invalid body')
  for (const f of collection(type).fields) {
    if (f.required && (body[f.name] === undefined || String(body[f.name]).trim() === '')) return jsonError(422, `${f.label} is required`)
  }
  await updateRow(type, id, body, g.session.user.id)
  return json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ type: string; id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { type, id } = await params
  if (!(type in COLLECTIONS)) return jsonError(404, 'Unknown collection')
  await deleteRow(type, id, g.session.user.id)
  return json({ ok: true })
}
