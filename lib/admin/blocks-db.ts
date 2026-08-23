import 'server-only'
// Page-copy block storage. Self-seeds from the registry on the editor load
// (INSERT missing; keep default_value/label synced with code but never overwrite
// an edited value). Reset restores default_value.
import { adminEnv } from './session'
import { BLOCKS } from './blocks-registry'
import { audit } from './db'

export interface BlockRow {
  key: string
  value: string
  default_value: string
  label: string
  page: string
  sort_order: number
  edited: boolean
}

export async function ensureBlocksSeeded(): Promise<void> {
  const db = adminEnv().DB
  const stmt = db.prepare(
    `INSERT INTO page_blocks (key, value, default_value, label, page, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET default_value = excluded.default_value, label = excluded.label, page = excluded.page, sort_order = excluded.sort_order`,
  )
  const entries = Object.entries(BLOCKS)
  await db.batch(entries.map(([key, b], i) => stmt.bind(key, b.default, b.default, b.label, b.page, i)))
}

export async function listBlocks(): Promise<BlockRow[]> {
  const { results } = await adminEnv().DB.prepare('SELECT key, value, default_value, label, page, sort_order FROM page_blocks ORDER BY page, sort_order').all<Omit<BlockRow, 'edited'>>()
  return (results ?? []).map((r) => ({ ...r, edited: r.value !== r.default_value }))
}

export async function setBlock(key: string, value: string, userId: string): Promise<void> {
  await adminEnv().DB.prepare("UPDATE page_blocks SET value = ?, updated_at = datetime('now'), updated_by = ? WHERE key = ?").bind(value, userId, key).run()
  await audit(userId, 'update', 'block', key)
}

export async function resetBlock(key: string, userId: string): Promise<string> {
  await adminEnv().DB.prepare("UPDATE page_blocks SET value = default_value, updated_at = datetime('now'), updated_by = ? WHERE key = ?").bind(userId, key).run()
  await audit(userId, 'update', 'block', key, { reset: true })
  const row = await adminEnv().DB.prepare('SELECT default_value FROM page_blocks WHERE key = ?').bind(key).first<{ default_value: string }>()
  return row?.default_value ?? ''
}
