// GET /admin/api/appointments/export — CSV of the current filtered view. Session
// required; writes an audit_log row every time (docs/11 § 5). no-store.
import { requireApiSession } from '@/lib/admin/guard'
import { listEnquiries, toCsv } from '@/lib/admin/enquiries-db'
import { audit } from '@/lib/admin/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<Response> {
  const g = await requireApiSession(req)
  if ('error' in g) return g.error
  const url = new URL(req.url)
  const filter = {
    status: url.searchParams.get('status') ?? 'new',
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  }
  const rows = await listEnquiries(filter)
  await audit(g.session.user.id, 'export', 'enquiry', 'csv', { count: rows.length, filter })
  return new Response(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="enquiries-${filter.status}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
