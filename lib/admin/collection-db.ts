import 'server-only'
// Generic CRUD for the four house-content collections (11g). Table and column
// names come only from the descriptor (COLLECTIONS) — never from the request —
// so the dynamic SQL is safe. Values are coerced to each field's type. Seeding
// runs once per table (only while empty) from the committed content/client JSON.
import { adminEnv } from './session'
import { audit } from './db'
import { COLLECTIONS, type Collection, type Field } from './collections'
import timelineJson from '@/content/client/02-timeline.json'
import processJson from '@/content/client/03-process.json'
import faqJson from '@/content/client/09-faq.json'
import peopleJson from '@/content/client/10-people.json'

export type Row = Record<string, string | number | null>

export function collection(type: string): Collection {
  const c = COLLECTIONS[type]
  if (!c) throw new Error(`Unknown collection: ${type}`)
  return c
}

// Coerce one incoming value to the column type. Empty optional → null.
function coerce(field: Field, raw: unknown): string | number | null {
  if (field.type === 'checkbox') return raw === true || raw === 'true' || raw === 'on' || raw === 1 ? 1 : 0
  if (field.type === 'number') {
    if (raw === '' || raw === null || raw === undefined) return field.required ? 0 : null
    const n = Number(raw)
    return Number.isFinite(n) ? n : field.required ? 0 : null
  }
  const s = raw == null ? '' : String(raw).trim()
  if (!s && !field.required) return null
  return s
}

function rowFromInput(c: Collection, input: Record<string, unknown>): Row {
  const out: Row = {}
  for (const f of c.fields) out[f.name] = coerce(f, input[f.name])
  return out
}

export async function listCollection(type: string): Promise<Row[]> {
  const c = collection(type)
  const cols = ['id', ...c.fields.map((f) => f.name)].join(', ')
  const { results } = await adminEnv().DB.prepare(`SELECT ${cols} FROM ${c.table} ORDER BY ${c.orderBy}`).all<Row>()
  return results ?? []
}

export async function getRow(type: string, id: string): Promise<Row | null> {
  const c = collection(type)
  const cols = ['id', ...c.fields.map((f) => f.name)].join(', ')
  return (await adminEnv().DB.prepare(`SELECT ${cols} FROM ${c.table} WHERE id = ?`).bind(id).first<Row>()) ?? null
}

export async function countCollection(type: string): Promise<number> {
  const c = collection(type)
  const r = await adminEnv().DB.prepare(`SELECT COUNT(*) AS n FROM ${c.table}`).first<{ n: number }>()
  return r?.n ?? 0
}

function insertStmt(c: Collection, id: string, row: Row) {
  const names = c.fields.map((f) => f.name)
  const cols = ['id', ...names]
  const sql = `INSERT INTO ${c.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
  return adminEnv().DB.prepare(sql).bind(id, ...names.map((n) => row[n] ?? null))
}

export async function createRow(type: string, input: Record<string, unknown>, userId: string): Promise<string> {
  const c = collection(type)
  const id = crypto.randomUUID()
  await insertStmt(c, id, rowFromInput(c, input)).run()
  await audit(userId, 'create', type, id)
  return id
}

export async function updateRow(type: string, id: string, input: Record<string, unknown>, userId: string): Promise<void> {
  const c = collection(type)
  const row = rowFromInput(c, input)
  const names = c.fields.map((f) => f.name)
  const sql = `UPDATE ${c.table} SET ${names.map((n) => `${n} = ?`).join(', ')} WHERE id = ?`
  await adminEnv().DB.prepare(sql).bind(...names.map((n) => row[n] ?? null), id).run()
  await audit(userId, 'update', type, id)
}

export async function deleteRow(type: string, id: string, userId: string): Promise<void> {
  const c = collection(type)
  await adminEnv().DB.prepare(`DELETE FROM ${c.table} WHERE id = ?`).bind(id).run()
  await audit(userId, 'delete', type, id)
}

// ---------- seed (once, while the table is empty) ----------
const SEED_JSON: Record<string, { [k: string]: unknown }> = {
  '02-timeline.json': timelineJson as Record<string, unknown>,
  '03-process.json': processJson as Record<string, unknown>,
  '09-faq.json': faqJson as Record<string, unknown>,
  '10-people.json': peopleJson as Record<string, unknown>,
}

// Map a committed JSON record to descriptor columns (JSON keys differ per file).
function seedRow(type: string, r: Record<string, unknown>, i: number): Row {
  const s = (v: unknown) => (v == null ? null : String(v))
  const n = (v: unknown) => (v == null || v === '' ? null : Number(v))
  switch (type) {
    case 'timeline':
      return { year: n(r.year), title: s(r.title), description: s(r.description) ?? '', sort_order: i, published: 1 }
    case 'process':
      return { sort_order: Number(r.order ?? i + 1), title: s(r.title), duration: s(r.duration), description: s(r.description) ?? '' }
    case 'people':
      return { name: s(r.name), role: s(r.role) ?? '', since: n(r.since), note: s(r.note) ?? '', consent_on_file: r.consentOnFile ? 1 : 0, sort_order: i, published: 0 }
    case 'faqs':
      return { grp: s(r.group) ?? 'buying', question: s(r.question), answer: s(r.answer) ?? '', sort_order: i, published: 1 }
    default:
      return {}
  }
}

export async function ensureCollectionSeeded(type: string): Promise<void> {
  if ((await countCollection(type)) > 0) return
  const c = collection(type)
  const records = (SEED_JSON[c.seedFile]?.[c.seedKey] as Record<string, unknown>[] | undefined) ?? []
  if (!records.length) return
  const stmts = records.map((r, i) => insertStmt(c, crypto.randomUUID(), seedRow(type, r, i)))
  await adminEnv().DB.batch(stmts)
}
