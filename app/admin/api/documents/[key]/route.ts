// PATCH /admin/api/documents/:key — save prose. POST — reset to committed file.
import { requireApiMutation } from '@/lib/admin/guard'
import { setDocument, resetDocument } from '@/lib/admin/documents-db'
import { DOC_BY_KEY } from '@/lib/admin/documents'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { key } = await params
  if (!DOC_BY_KEY[key]) return jsonError(404, 'Unknown document')
  const b = (await req.json().catch(() => null)) as { body?: unknown } | null
  if (!b || typeof b.body !== 'string') return jsonError(400, 'Missing body')
  const body = b.body.trim()
  if (!body) return jsonError(422, 'Content cannot be empty — use reset to restore the original')
  await setDocument(key, body, g.session.user.id)
  return json({ ok: true, body, edited: body !== DOC_BY_KEY[key]!.body() })
}

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { key } = await params
  if (!DOC_BY_KEY[key]) return jsonError(404, 'Unknown document')
  const body = await resetDocument(key, g.session.user.id)
  return json({ ok: true, body, edited: false })
}
