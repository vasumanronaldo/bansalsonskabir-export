// GET /admin/api/backup — full JSON backup of the site's content + operational
// data. Session required; every download is audited. no-store.
import { requireApiSession } from '@/lib/admin/guard'
import { exportAll } from '@/lib/admin/backup'
import { audit } from '@/lib/admin/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<Response> {
  const g = await requireApiSession(req)
  if ('error' in g) return g.error
  const data = await exportAll()
  const counts = Object.fromEntries(Object.entries(data).map(([t, rows]) => [t, rows.length]))
  await audit(g.session.user.id, 'export', 'backup', 'json', counts)
  const stamp = new Date().toISOString().slice(0, 10)
  const body = JSON.stringify({ exported_at: new Date().toISOString(), tables: data }, null, 2)
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="bansal-sons-backup-${stamp}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
