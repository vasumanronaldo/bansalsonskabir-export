import 'server-only'
// Journal data layer (admin). Mirrors lib/admin/db.ts for pieces: create, edit
// with optimistic concurrency, publish gated on excerpt + cover(+alt) + SEO
// description, soft delete. Slug frozen once published_at is set.
import { adminEnv } from './session'
import { audit } from './db'

export interface JournalListRow {
  id: string
  slug: string
  title: string
  category: string
  published: number
  published_at: string | null
  updated_at: string
  cover_key_640: string | null
}
export interface JournalRecord {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: string
  author: string
  cover_image_id: string | null
  cover_key: string | null
  cover_key_640: string | null
  cover_alt: string | null
  published: number
  published_at: string | null
  seo_title: string
  seo_description: string
  updated_at: string
}

function db(): D1Database {
  return adminEnv().DB
}

export async function listJournal(): Promise<JournalListRow[]> {
  const { results } = await db()
    .prepare(
      `SELECT j.id, j.slug, j.title, j.category, j.published, j.published_at, j.updated_at, i.r2_key_640 AS cover_key_640
         FROM journal_posts j LEFT JOIN images i ON j.cover_image_id = i.id
        WHERE j.deleted_at IS NULL
        ORDER BY COALESCE(j.published_at, j.updated_at) DESC`,
    )
    .all<JournalListRow>()
  return results ?? []
}

export async function getJournalPost(id: string): Promise<JournalRecord | null> {
  return (
    (await db()
      .prepare(
        `SELECT j.id, j.slug, j.title, j.excerpt, j.body, j.category, j.author, j.cover_image_id,
                j.published, j.published_at, j.seo_title, j.seo_description, j.updated_at,
                i.r2_key AS cover_key, i.r2_key_640 AS cover_key_640, i.alt AS cover_alt
           FROM journal_posts j LEFT JOIN images i ON j.cover_image_id = i.id
          WHERE j.id = ? AND j.deleted_at IS NULL`,
      )
      .bind(id)
      .first<JournalRecord>()) ?? null
  )
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'post'
}
async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  let slug = base
  for (let n = 2; ; n++) {
    const hit = await db().prepare('SELECT id FROM journal_posts WHERE slug = ?').bind(slug).first<{ id: string }>()
    if (!hit || hit.id === exceptId) return slug
    slug = `${base}-${n}`
  }
}

export async function createJournalPost(userId: string, title: string): Promise<string> {
  const id = crypto.randomUUID()
  const slug = await uniqueSlug(slugify(title))
  await db()
    .prepare('INSERT INTO journal_posts (id, slug, title, created_by, updated_by) VALUES (?, ?, ?, ?, ?)')
    .bind(id, slug, title.trim(), userId, userId)
    .run()
  await audit(userId, 'create', 'journal', id, { title })
  return id
}

export interface JournalFields {
  title: string
  slug: string
  excerpt: string
  body: string
  category: string
  author: string
  cover_image_id: string | null
  published_at: string | null
  seo_title: string
  seo_description: string
}

export async function updateJournalPost(
  id: string,
  ifUnmodifiedSince: string,
  f: JournalFields,
  userId: string,
): Promise<{ ok: true; updatedAt: string } | { ok: false; conflict: true; updatedBy: string | null; updatedAt: string }> {
  const cur = await db().prepare('SELECT updated_at, updated_by, published_at FROM journal_posts WHERE id = ? AND deleted_at IS NULL').bind(id).first<{ updated_at: string; updated_by: string | null; published_at: string | null }>()
  if (!cur) return { ok: false, conflict: true, updatedBy: null, updatedAt: '' }
  if (cur.updated_at !== ifUnmodifiedSince) {
    let who: string | null = null
    if (cur.updated_by) who = (await db().prepare('SELECT name FROM users WHERE id = ?').bind(cur.updated_by).first<{ name: string }>())?.name ?? null
    return { ok: false, conflict: true, updatedBy: who, updatedAt: cur.updated_at }
  }
  // Slug is frozen once the post has been published.
  const slug = cur.published_at ? undefined : await uniqueSlug(slugify(f.slug || f.title), id)
  await db()
    .prepare(
      `UPDATE journal_posts SET title=?, ${slug ? 'slug=?, ' : ''}excerpt=?, body=?, category=?, author=?, cover_image_id=?, published_at=?, seo_title=?, seo_description=?, updated_at=datetime('now'), updated_by=? WHERE id=?`,
    )
    .bind(...[f.title.trim(), ...(slug ? [slug] : []), f.excerpt, f.body, f.category, f.author.trim(), f.cover_image_id, f.published_at || null, f.seo_title, f.seo_description, userId, id])
    .run()
  await audit(userId, 'update', 'journal', id)
  const fresh = await db().prepare('SELECT updated_at FROM journal_posts WHERE id = ?').bind(id).first<{ updated_at: string }>()
  return { ok: true, updatedAt: fresh?.updated_at ?? ifUnmodifiedSince }
}

export async function publishJournalPost(id: string, userId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const p = await db()
    .prepare(
      `SELECT j.excerpt, j.seo_description, j.cover_image_id, i.alt AS cover_alt
         FROM journal_posts j LEFT JOIN images i ON j.cover_image_id = i.id WHERE j.id = ? AND j.deleted_at IS NULL`,
    )
    .bind(id)
    .first<{ excerpt: string; seo_description: string; cover_image_id: string | null; cover_alt: string | null }>()
  if (!p) return { ok: false, reason: 'Post not found.' }
  const missing: string[] = []
  if (!p.excerpt.trim()) missing.push('an excerpt')
  if (!p.cover_image_id) missing.push('a cover image')
  else if (!(p.cover_alt ?? '').trim()) missing.push('alt text on the cover image')
  if (!p.seo_description.trim()) missing.push('an SEO description')
  if (missing.length) return { ok: false, reason: `Add ${missing.join(', ')} before publishing.` }
  await db().prepare("UPDATE journal_posts SET published=1, published_at=COALESCE(published_at, datetime('now')), updated_at=datetime('now'), updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'publish', 'journal', id)
  return { ok: true }
}

export async function unpublishJournalPost(id: string, userId: string): Promise<void> {
  await db().prepare("UPDATE journal_posts SET published=0, updated_at=datetime('now'), updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'unpublish', 'journal', id)
}

export async function softDeleteJournalPost(id: string, userId: string): Promise<void> {
  await db().prepare("UPDATE journal_posts SET deleted_at=datetime('now'), published=0, updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'delete', 'journal', id)
}
