// GET /admin/api/subscribers/export — CSV of the current filtered subscribers.
import { requireApiSession } from '@/lib/admin/guard'
import { listSubscribers, subscribersCsv } from '@/lib/admin/subscribers-db'
import { audit } from '@/lib/admin/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<Response> {
  const g = await requireApiSession(req)
  if ('error' in g) return g.error
  const status = new URL(req.url).searchParams.get('status') ?? 'confirmed'
  const rows = await listSubscribers(status)
  await audit(g.session.user.id, 'export', 'subscriber', 'csv', { count: rows.length, status })
  return new Response(subscribersCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${status}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
