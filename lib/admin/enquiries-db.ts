import 'server-only'
// Appointment enquiries data layer. The most sensitive surface — names + phone
// numbers. No enquiry data ever goes in a URL; the detail route keys on the
// opaque id only.
import { adminEnv } from './session'
import { audit } from './db'

export const ENQ_STATUSES = ['new', 'contacted', 'booked', 'closed'] as const
export type EnqStatus = (typeof ENQ_STATUSES)[number]

export interface EnquiryRow {
  id: string
  name: string
  phone: string
  email: string | null
  preferred_date: string | null
  preferred_time: string | null
  occasion: string | null
  interest: string | null
  budget: string | null
  requirement: string | null
  contact_method: string | null
  status: string
  note: string
  submitted_at: string
  notified_at: string | null
  handled_at: string | null
}

export interface EnquiryFilter {
  status?: string
  from?: string
  to?: string
}

function where(f: EnquiryFilter): { sql: string; binds: (string)[] } {
  const clauses = ['1 = 1']
  const binds: string[] = []
  if (f.status && f.status !== 'all') {
    clauses.push('status = ?')
    binds.push(f.status)
  }
  if (f.from) {
    clauses.push('submitted_at >= ?')
    binds.push(f.from)
  }
  if (f.to) {
    clauses.push('submitted_at <= ?')
    binds.push(`${f.to} 23:59:59`)
  }
  return { sql: clauses.join(' AND '), binds }
}

export async function listEnquiries(f: EnquiryFilter): Promise<EnquiryRow[]> {
  const { sql, binds } = where(f)
  const { results } = await adminEnv()
    .DB.prepare(`SELECT id, name, phone, email, preferred_date, preferred_time, occasion, interest, budget, requirement, contact_method, status, note, submitted_at, notified_at, handled_at FROM enquiries WHERE ${sql} ORDER BY submitted_at DESC`)
    .bind(...binds)
    .all<EnquiryRow>()
  return results ?? []
}

export async function getEnquiry(id: string): Promise<EnquiryRow | null> {
  return (
    (await adminEnv()
      .DB.prepare('SELECT id, name, phone, email, preferred_date, preferred_time, occasion, interest, budget, requirement, contact_method, status, note, submitted_at, notified_at, handled_at FROM enquiries WHERE id = ?')
      .bind(id)
      .first<EnquiryRow>()) ?? null
  )
}

export async function setEnquiryStatus(id: string, status: EnqStatus, userId: string): Promise<void> {
  await adminEnv().DB.prepare("UPDATE enquiries SET status = ?, handled_by = ?, handled_at = datetime('now') WHERE id = ?").bind(status, userId, id).run()
  await audit(userId, 'update', 'enquiry', id, { status })
}

export async function setEnquiryNote(id: string, note: string, userId: string): Promise<void> {
  await adminEnv().DB.prepare('UPDATE enquiries SET note = ?, handled_by = ? WHERE id = ?').bind(note, userId, id).run()
  await audit(userId, 'update', 'enquiry', id, { note: 'edited' })
}

const CSV_COLS: Array<[keyof EnquiryRow, string]> = [
  ['submitted_at', 'Submitted'], ['status', 'Status'], ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'],
  ['occasion', 'Occasion'], ['preferred_date', 'Preferred date'], ['preferred_time', 'Preferred time'],
  ['interest', 'Interest'], ['budget', 'Budget'], ['requirement', 'Requirement'], ['contact_method', 'Contact via'], ['note', 'Note'],
]
function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function toCsv(rows: EnquiryRow[]): string {
  const head = CSV_COLS.map(([, label]) => label).join(',')
  const body = rows.map((r) => CSV_COLS.map(([k]) => csvCell(r[k])).join(',')).join('\n')
  return `${head}\n${body}\n`
}
