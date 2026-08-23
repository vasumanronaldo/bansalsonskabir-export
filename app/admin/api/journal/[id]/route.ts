// PATCH /admin/api/journal/:id — save (optimistic concurrency). DELETE — soft delete.
import { requireApiMutation } from '@/lib/admin/guard'
import { updateJournalPost, softDeleteJournalPost } from '@/lib/admin/journal-db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { id } = await params
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!b || typeof b.title !== 'string' || !b.updatedAt) return jsonError(400, 'Missing fields')
  const r = await updateJournalPost(
    id,
    String(b.updatedAt),
    {
      title: String(b.title),
      slug: String(b.slug ?? ''),
      excerpt: String(b.excerpt ?? ''),
      body: String(b.body ?? ''),
      category: String(b.category ?? 'house'),
      author: String(b.author ?? ''),
      cover_image_id: (b.cover_image_id as string | null) ?? null,
      published_at: (b.published_at as string | null) ?? null,
      seo_title: String(b.seo_title ?? ''),
      seo_description: String(b.seo_description ?? ''),
    },
    g.session.user.id,
  )
  if (!r.ok) return json({ conflict: true, updatedBy: r.updatedBy, updatedAt: r.updatedAt }, 409)
  return json({ ok: true, updatedAt: r.updatedAt })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { id } = await params
  await softDeleteJournalPost(id, g.session.user.id)
  return json({ ok: true })
}
