// POST /admin/api/collections/:type — create a row in a house-content collection.
import { requireApiMutation } from '@/lib/admin/guard'
import { createRow, collection } from '@/lib/admin/collection-db'
import { COLLECTIONS } from '@/lib/admin/collections'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function POST(req: Request, { params }: { params: Promise<{ type: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { type } = await params
  if (!(type in COLLECTIONS)) return jsonError(404, 'Unknown collection')
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return jsonError(400, 'Invalid body')
  for (const f of collection(type).fields) {
    if (f.required && (body[f.name] === undefined || String(body[f.name]).trim() === '')) return jsonError(422, `${f.label} is required`)
  }
  const id = await createRow(type, body, g.session.user.id)
  return json({ ok: true, id }, 201)
}
