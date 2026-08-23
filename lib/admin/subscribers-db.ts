import 'server-only'
// Newsletter subscribers (docs/11 § 1 Newsletter). List + CSV export.
import { adminEnv } from './session'

export interface Subscriber {
  id: string
  email: string
  status: 'pending' | 'confirmed' | 'unsubscribed'
  confirmed_at: string | null
  unsubscribed_at: string | null
  created_at: string
}

export async function listSubscribers(status?: string): Promise<Subscriber[]> {
  const db = adminEnv().DB
  const sql = status && status !== 'all'
    ? 'SELECT id, email, status, confirmed_at, unsubscribed_at, created_at FROM subscribers WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT id, email, status, confirmed_at, unsubscribed_at, created_at FROM subscribers ORDER BY created_at DESC'
  const stmt = db.prepare(sql)
  const { results } = await (status && status !== 'all' ? stmt.bind(status) : stmt).all<Subscriber>()
  return results ?? []
}

export async function subscriberCounts(): Promise<Record<string, number>> {
  const { results } = await adminEnv().DB.prepare('SELECT status, COUNT(*) AS n FROM subscribers GROUP BY status').all<{ status: string; n: number }>()
  const out: Record<string, number> = { confirmed: 0, pending: 0, unsubscribed: 0 }
  for (const r of results ?? []) out[r.status] = r.n
  return out
}

const cell = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`

export function subscribersCsv(rows: Subscriber[]): string {
  const head = ['email', 'status', 'confirmed_at', 'unsubscribed_at', 'created_at']
  const lines = rows.map((r) => [r.email, r.status, r.confirmed_at, r.unsubscribed_at, r.created_at].map(cell).join(','))
  return [head.join(','), ...lines].join('\r\n')
}
