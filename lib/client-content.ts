// The single source of truth for every unconfirmed client fact.
//
// RULE (CLAUDE.md): never hardcode an address, hour, percentage or piece title
// into a component. Read it here. Every record carries `_meta` (approval +
// what it still needs) so <DraftFlag> can mark unconfirmed content — in
// development only, never in a production build.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), 'content', 'client')

export interface ContentMeta {
  /** file name, e.g. "00-settings.json" */
  file: string
  /** human has confirmed this content */
  approved: boolean
  /** what still needs a real answer */
  needs: string[]
  /** count of unfilled [TK] markers in the raw file */
  tk: number
}

function countTk(raw: string): number {
  return (raw.match(/\[TK\]/g) || []).length
}

// ── JSON files: `_approved` / `_needs` ─────────────────────────────────────
function loadJson<T>(file: string): { data: T; _meta: ContentMeta } {
  const raw = readFileSync(join(DIR, file), 'utf8')
  const json = JSON.parse(raw) as Record<string, unknown> & T
  const _meta: ContentMeta = {
    file,
    approved: json._approved === true,
    needs: (json._needs as string[]) ?? [],
    tk: countTk(raw),
  }
  return { data: json, _meta }
}

// ── Markdown files: YAML front matter `approved:` / `needs:` + body ────────
function loadMarkdown(file: string): { body: string; _meta: ContentMeta } {
  const raw = readFileSync(join(DIR, file), 'utf8')
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!fm) {
    return { body: raw, _meta: { file, approved: false, needs: ['missing front matter'], tk: countTk(raw) } }
  }
  const front = fm[1] ?? ''
  const body = (fm[2] ?? '').trim()
  const approved = /^approved:\s*true\s*$/m.test(front)
  const needsLine = front.match(/^needs:\s*\[(.*)\]\s*$/m)
  const needs = needsLine ? needsLine[1]!.split(',').map((s) => s.trim()).filter(Boolean) : []
  return { body, _meta: { file, approved, needs, tk: countTk(raw) } }
}

// ── Types (shapes mirror content/client/*.json) ────────────────────────────
export interface Settings {
  legalName: string
  editorialName: string
  foundedYear: number
  founder: string
  leadership: string[]
  address: { line1: string; line2: string; city: string; postalCode: string; region: string; country: string }
  phone: string
  whatsapp: string
  email: string
  instagram: string
  domain: string
  hours: Array<{ days: string; open: string | null; close: string | null; label?: string }>
  appointmentSlots: Array<{ value: string; label: string }>
  parking: string
  metro: { station: string; line: string; walkMinutes: number }
  landmark: string
  geo: { latitude: number; longitude: number }
  gstin: string
  bisRegistration: string
  certifications: string[]
}

export interface Person {
  name: string
  role: string
  since: number | null
  consentOnFile: boolean
  note?: string
}
export interface People {
  people: Person[]
  workshop: Record<string, string>
}

// ── Typed loaders ──────────────────────────────────────────────────────────
export const getSettings = () => loadJson<Settings>('00-settings.json')
export const getFounder = () => loadMarkdown('01-founder.md')
export const getTimeline = () => loadJson<{ events: unknown[] }>('02-timeline.json')
export const getProcess = () => loadJson<{ steps: unknown[] }>('03-process.json')
export const getCollections = () => loadJson<{ collections: unknown[] }>('04-collections.json')
export const getPieces = () => loadJson<{ pieces: unknown[] }>('05-pieces.json')
export const getPricing = () => loadMarkdown('06-pricing.md')
export const getAftercare = () => loadMarkdown('07-aftercare.md')
export const getPrivacy = () => loadMarkdown('08-privacy.md')
export const getFaq = () => loadJson<{ faqs: unknown[] }>('09-faq.json')
export const getPeople = () => loadJson<People>('10-people.json')
export const getCommissionTerms = () => loadMarkdown('11-commission-terms.md')

/** True when we're allowed to surface DRAFT / [TK] affordances (dev only). */
export const showDraftAffordances = process.env.NODE_ENV !== 'production'

/** Programmatic status of every content file (mirrors content-status.mjs). */
export function contentStatus(): ContentMeta[] {
  return readdirSync(DIR)
    .filter((f) => (f.endsWith('.json') || f.endsWith('.md')) && f !== 'README.md')
    .sort()
    .map((file) => (file.endsWith('.json') ? loadJson(file)._meta : loadMarkdown(file)._meta))
}
