import 'server-only'
// Full-content backup (docs/11 § 1 Backup). Dumps every content and operational
// table as one JSON document. Secrets never leave the box: sessions and
// login_attempts are excluded entirely, and users export only safe columns (no
// password hash, no tokens).
import { adminEnv } from './session'

// '*' = all columns; an array = explicit safe columns only.
const TABLES: Record<string, '*' | string[]> = {
  users: ['id', 'email', 'name', 'role', 'disabled', 'created_at'],
  pieces: '*',
  collections: '*',
  journal_posts: '*',
  images: '*',
  enquiries: '*',
  subscribers: '*',
  redirects: '*',
  settings: '*',
  page_blocks: '*',
  timeline_events: '*',
  process_steps: '*',
  people: '*',
  faqs: '*',
  audit_log: '*',
}

export async function exportAll(): Promise<Record<string, unknown[]>> {
  const db = adminEnv().DB
  const out: Record<string, unknown[]> = {}
  for (const [table, cols] of Object.entries(TABLES)) {
    const select = cols === '*' ? '*' : cols.join(', ')
    try {
      const { results } = await db.prepare(`SELECT ${select} FROM ${table}`).all()
      out[table] = results ?? []
    } catch {
      out[table] = [] // table may not exist in an older DB — skip cleanly
    }
  }
  return out
}
