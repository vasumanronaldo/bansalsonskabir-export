import 'server-only'
// Storage for the long-form page prose. Self-seeds each document from its
// committed file body on first read, keeps edits, and can reset to the file.
import { adminEnv } from './session'
import { audit } from './db'
import { DOCUMENTS, DOC_BY_KEY } from './documents'

export interface DocRow {
  key: string
  label: string
  page: string
  body: string
  edited: boolean
}

export async function ensureDocsSeeded(): Promise<void> {
  const db = adminEnv().DB
  const { results } = await db.prepare('SELECT key FROM documents').all<{ key: string }>()
  const have = new Set((results ?? []).map((r) => r.key))
  const missing = DOCUMENTS.filter((d) => !have.has(d.key))
  if (!missing.length) return
  const stmt = db.prepare('INSERT INTO documents (key, body) VALUES (?, ?)')
  await db.batch(missing.map((d) => stmt.bind(d.key, d.body())))
}

export async function listDocuments(): Promise<DocRow[]> {
  await ensureDocsSeeded()
  const { results } = await adminEnv().DB.prepare('SELECT key, body FROM documents').all<{ key: string; body: string }>()
  const map = new Map((results ?? []).map((r) => [r.key, r.body]))
  return DOCUMENTS.map((d) => {
    const body = map.get(d.key) ?? d.body()
    return { key: d.key, label: d.label, page: d.page, body, edited: body !== d.body() }
  })
}

export async function setDocument(key: string, body: string, userId: string): Promise<void> {
  if (!DOC_BY_KEY[key]) throw new Error('Unknown document')
  await adminEnv()
    .DB.prepare("INSERT INTO documents (key, body, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET body = excluded.body, updated_by = excluded.updated_by, updated_at = datetime('now')")
    .bind(key, body, userId)
    .run()
  await audit(userId, 'update', 'document', key)
}

export async function resetDocument(key: string, userId: string): Promise<string> {
  const def = DOC_BY_KEY[key]
  if (!def) throw new Error('Unknown document')
  const body = def.body()
  await adminEnv().DB.prepare("INSERT INTO documents (key, body, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET body = excluded.body, updated_by = excluded.updated_by, updated_at = datetime('now')").bind(key, body, userId).run()
  await audit(userId, 'update', 'document', key, { reset: true })
  return body
}
