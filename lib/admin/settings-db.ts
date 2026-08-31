import 'server-only'
// Settings + per-page SEO overrides (docs/11 § 1 Settings). Stored in the
// settings table as JSON blobs: key 'business' for contact/hours, and
// 'seo.<page>' per page. Every field is optional — a blank one falls back to the
// committed content, so this can only ever refine, never break, the site.
import { adminEnv } from './session'
import { audit } from './db'
import { BUSINESS_FIELDS, SEO_PAGES, EMPTY_BUSINESS, type Business, type Seo, type SettingsForm } from './settings-shared'

export { BUSINESS_FIELDS, SEO_PAGES }
export type { Business, Seo, SettingsForm }

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await adminEnv().DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>()
    return row ? { ...fallback, ...(JSON.parse(row.value) as Partial<T>) } : fallback
  } catch {
    return fallback
  }
}

export async function getSettingsForm(): Promise<SettingsForm> {
  const business = await readJson<Business>('business', EMPTY_BUSINESS)
  const seo: Record<string, Seo> = {}
  for (const p of SEO_PAGES) seo[p.key] = await readJson<Seo>(`seo.${p.key}`, { title: '', description: '' })
  return { business, seo }
}

async function writeJson(key: string, value: unknown, userId: string): Promise<void> {
  await adminEnv()
    .DB.prepare("INSERT INTO settings (key, value, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')")
    .bind(key, JSON.stringify(value), userId)
    .run()
}

export async function saveSettings(form: SettingsForm, userId: string): Promise<void> {
  await writeJson('business', form.business, userId)
  for (const p of SEO_PAGES) await writeJson(`seo.${p.key}`, form.seo[p.key] ?? { title: '', description: '' }, userId)
  await audit(userId, 'update', 'settings', 'business+seo')
}

// ---------- public resolvers ----------
import { getCloudflareContext } from '@opennextjs/cloudflare'

async function publicJson<T extends object>(key: string): Promise<Partial<T>> {
  try {
    const row = await getCloudflareContext().env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>()
    return row ? (JSON.parse(row.value) as Partial<T>) : {}
  } catch {
    return {}
  }
}

// Only non-empty overrides are returned, so callers can spread over defaults.
export async function businessOverride(): Promise<Partial<Business>> {
  const raw = await publicJson<Business>('business')
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'string' && v.trim() !== '')) as Partial<Business>
}

import type { Settings } from '@/lib/client-content'

// THE single public settings resolver: merge the admin's business overrides over
// the committed file settings (contact, address, hours). Every public consumer —
// Footer, contact, appointment — reads through this so one edit shows everywhere.
export async function resolvePublicSettings(file: Settings): Promise<Settings & { hoursNote: string }> {
  const b = await businessOverride()
  const address = {
    ...file.address,
    line1: b.addrLine1 ?? file.address.line1,
    line2: b.addrLine2 ?? file.address.line2,
    city: b.addrCity ?? file.address.city,
    postalCode: b.addrPostal ?? file.address.postalCode,
  }
  let hours = file.hours
  if (b.hoursJson) {
    try {
      const parsed = JSON.parse(b.hoursJson)
      if (Array.isArray(parsed) && parsed.length) hours = parsed as Settings['hours']
    } catch {
      // Malformed override — keep the committed hours rather than break the page.
    }
  }
  return {
    ...file,
    phone: b.phone ?? file.phone,
    whatsapp: (b.whatsapp ?? file.whatsapp).replace(/\D/g, ''),
    email: b.email ?? file.email,
    instagram: (b.instagram ?? file.instagram).replace(/^@/, ''),
    address,
    hours,
    hoursNote: b.hoursNote ?? '',
  }
}

export async function seoOverride(page: string): Promise<Partial<Seo>> {
  const raw = await publicJson<Seo>(`seo.${page}`)
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'string' && v.trim() !== '')) as Partial<Seo>
}

import type { Metadata } from 'next'

/** Merge the family's per-page SEO overrides over a page's committed metadata. */
export async function withSeoOverride(page: string, base: Metadata): Promise<Metadata> {
  const o = await seoOverride(page)
  return { ...base, ...(o.title ? { title: o.title } : {}), ...(o.description ? { description: o.description } : {}) }
}
