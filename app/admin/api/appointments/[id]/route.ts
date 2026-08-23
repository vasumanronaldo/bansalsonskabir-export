// PATCH /admin/api/appointments/:id — change status and/or internal note.
import { requireApiMutation } from '@/lib/admin/guard'
import { setEnquiryStatus, setEnquiryNote, ENQ_STATUSES, type EnqStatus } from '@/lib/admin/enquiries-db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const { id } = await params
  const b = (await req.json().catch(() => null)) as { status?: string; note?: string } | null
  if (!b) return jsonError(400, 'Missing body')
  if (typeof b.status === 'string') {
    if (!(ENQ_STATUSES as readonly string[]).includes(b.status)) return jsonError(400, 'Invalid status')
    await setEnquiryStatus(id, b.status as EnqStatus, g.session.user.id)
  }
  if (typeof b.note === 'string') await setEnquiryNote(id, b.note, g.session.user.id)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
