import 'server-only'
// Public reader for the house-content collections (11g). Each getter returns the
// shape its block already expects, sourced from D1 when the table has rows and
// falling back to the committed content/client JSON otherwise (empty table, or
// D1 unavailable at build). So the site behaves exactly as before until the
// family edits, then reflects their edits with no rebuild.
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getTimeline, getProcess, getPeople, getFaq } from '@/lib/client-content'

export interface TimelineEvent { year: number; title: string; description?: string }
export interface ProcessStep { order: number; title: string; duration?: string; description?: string }
export interface BenchPerson { name: string; role: string; since: number | null; consentOnFile: boolean; note?: string }
export interface FaqItem { group: string; question: string; answer: string }

async function query<T>(sql: string): Promise<T[] | null> {
  try {
    const { results } = await getCloudflareContext().env.DB.prepare(sql).all<T>()
    return results && results.length ? results : null
  } catch {
    return null
  }
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const rows = await query<{ year: number; title: string; description: string }>(
    'SELECT year, title, description FROM timeline_events WHERE published = 1 ORDER BY year ASC, sort_order ASC',
  )
  if (rows) return rows.map((r) => ({ year: r.year, title: r.title, description: r.description || undefined }))
  return ((getTimeline().data.events as TimelineEvent[]) ?? []).slice()
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  const rows = await query<{ sort_order: number; title: string; duration: string | null; description: string }>(
    'SELECT sort_order, title, duration, description FROM process_steps ORDER BY sort_order ASC',
  )
  if (rows) return rows.map((r) => ({ order: r.sort_order, title: r.title, duration: r.duration || undefined, description: r.description || undefined }))
  return ((getProcess().data.steps as ProcessStep[]) ?? []).slice()
}

export async function getBenchPeople(): Promise<BenchPerson[]> {
  const rows = await query<{ name: string; role: string; since: number | null; note: string; consent_on_file: number; published: number }>(
    'SELECT name, role, since, note, consent_on_file, published FROM people WHERE published = 1 ORDER BY sort_order ASC, name ASC',
  )
  if (rows) return rows.map((r) => ({ name: r.name, role: r.role, since: r.since, consentOnFile: r.consent_on_file === 1, note: r.note || undefined }))
  return ((getPeople().data.people as BenchPerson[]) ?? []).slice()
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const rows = await query<{ grp: string; question: string; answer: string }>(
    'SELECT grp, question, answer FROM faqs WHERE published = 1 ORDER BY grp ASC, sort_order ASC',
  )
  if (rows) return rows.map((r) => ({ group: r.grp, question: r.question, answer: r.answer }))
  return ((getFaq().data.faqs as FaqItem[]) ?? []).slice()
}
