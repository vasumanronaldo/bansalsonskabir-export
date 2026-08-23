// PATCH /admin/api/blocks/:key — save copy. POST — reset to committed default.
import { requireApiMutation } from '@/lib/admin/guard'
import { setBlock, resetBlock } from '@/lib/admin/blocks-db'
import { BLOCKS } from '@/lib/admin/blocks-registry'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { key } = await params
  if (!(key in BLOCKS)) return jsonError(404, 'Unknown block')
  const b = (await req.json().catch(() => null)) as { value?: unknown } | null
  if (!b || typeof b.value !== 'string') return jsonError(400, 'Missing value')
  const value = b.value.trim()
  if (!value) return jsonError(422, 'Copy cannot be empty — use reset to restore the default')
  await setBlock(key, value, g.session.user.id)
  return json({ ok: true, value, edited: value !== BLOCKS[key]!.default })
}

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { key } = await params
  if (!(key in BLOCKS)) return jsonError(404, 'Unknown block')
  const value = await resetBlock(key, g.session.user.id)
  return json({ ok: true, value, edited: false })
}
