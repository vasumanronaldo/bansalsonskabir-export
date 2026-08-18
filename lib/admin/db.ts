import 'server-only'
// D1 data layer for the admin portal. Pieces, collections, images, audit. No
// price anywhere. Slugs are frozen after creation (a slug change writes a
// redirect row, never a silent edit — see changeSlug in a later phase).
import { adminEnv } from './session'

export interface CollectionOption {
  id: string
  title: string
}
export interface PieceListRow {
  id: string
  slug: string
  name: string
  collection_title: string | null
  published: number
  updated_at: string
  cover_key_640: string | null
}
export interface ImageRow {
  id: string
  r2_key: string
  r2_key_640: string | null
  width: number
  height: number
  alt: string
  sort_order: number
  is_cover: number
}
export interface PieceRecord {
  id: string
  slug: string
  name: string
  subtitle: string
  collection_id: string | null
  description: string
  featured: number
  published: number
  updated_at: string
  images: ImageRow[]
}

function db(): D1Database {
  return adminEnv().DB
}

export async function audit(userId: string, action: string, entity: string, entityId: string, detail?: unknown) {
  await db()
    .prepare('INSERT INTO audit_log (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)')
    .bind(userId, action, entity, entityId, detail ? JSON.stringify(detail) : null)
    .run()
}

export async function collectionOptions(): Promise<CollectionOption[]> {
  const { results } = await db().prepare('SELECT id, title FROM collections ORDER BY sort_order, title').all<CollectionOption>()
  return results ?? []
}

export async function listPieces(): Promise<PieceListRow[]> {
  const { results } = await db()
    .prepare(
      `SELECT p.id, p.slug, p.name, p.published, p.updated_at, c.title AS collection_title,
              (SELECT r2_key_640 FROM images i WHERE i.piece_id = p.id AND i.deleted_at IS NULL ORDER BY i.is_cover DESC, i.sort_order LIMIT 1) AS cover_key_640
         FROM pieces p LEFT JOIN collections c ON c.id = p.collection_id
        WHERE p.deleted_at IS NULL
        ORDER BY p.updated_at DESC`,
    )
    .all<PieceListRow>()
  return results ?? []
}

export async function getPiece(id: string): Promise<PieceRecord | null> {
  const piece = await db()
    .prepare('SELECT id, slug, name, subtitle, collection_id, description, featured, published, updated_at FROM pieces WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<Omit<PieceRecord, 'images'>>()
  if (!piece) return null
  const { results } = await db()
    .prepare('SELECT id, r2_key, r2_key_640, width, height, alt, sort_order, is_cover FROM images WHERE piece_id = ? AND deleted_at IS NULL ORDER BY sort_order, created_at')
    .bind(id)
    .all<ImageRow>()
  return { ...piece, images: results ?? [] }
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'piece'
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  for (let n = 2; ; n++) {
    const hit = await db().prepare('SELECT 1 FROM pieces WHERE slug = ?').bind(slug).first()
    if (!hit) return slug
    slug = `${base}-${n}`
  }
}

export async function createPiece(userId: string, name: string): Promise<string> {
  const id = crypto.randomUUID()
  const slug = await uniqueSlug(slugify(name))
  await db()
    .prepare('INSERT INTO pieces (id, slug, name, created_by, updated_by) VALUES (?, ?, ?, ?, ?)')
    .bind(id, slug, name.trim(), userId, userId)
    .run()
  await audit(userId, 'create', 'piece', id, { name })
  return id
}

/** Optimistic concurrency: rejects when updated_at has moved since the client loaded. */
export async function updatePiece(
  id: string,
  ifUnmodifiedSince: string,
  fields: { name: string; subtitle: string; collection_id: string | null; description: string; featured: number },
  userId: string,
): Promise<{ ok: true; updatedAt: string } | { ok: false; conflict: true; updatedBy: string | null; updatedAt: string }> {
  const current = await db().prepare('SELECT updated_at, updated_by FROM pieces WHERE id = ? AND deleted_at IS NULL').bind(id).first<{ updated_at: string; updated_by: string | null }>()
  if (!current) return { ok: false, conflict: true, updatedBy: null, updatedAt: '' }
  if (current.updated_at !== ifUnmodifiedSince) {
    let who: string | null = null
    if (current.updated_by) who = (await db().prepare('SELECT name FROM users WHERE id = ?').bind(current.updated_by).first<{ name: string }>())?.name ?? null
    return { ok: false, conflict: true, updatedBy: who, updatedAt: current.updated_at }
  }
  await db()
    .prepare("UPDATE pieces SET name=?, subtitle=?, collection_id=?, description=?, featured=?, updated_at=datetime('now'), updated_by=? WHERE id=?")
    .bind(fields.name.trim(), fields.subtitle.trim(), fields.collection_id, fields.description, fields.featured, userId, id)
    .run()
  await audit(userId, 'update', 'piece', id, { fields: Object.keys(fields) })
  const fresh = await db().prepare('SELECT updated_at FROM pieces WHERE id = ?').bind(id).first<{ updated_at: string }>()
  return { ok: true, updatedAt: fresh?.updated_at ?? ifUnmodifiedSince }
}

/** Publish is blocked when any live image lacks alt text (docs/10 § 5). */
export async function publishPiece(id: string, userId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const missing = await db()
    .prepare('SELECT COUNT(*) AS n FROM images WHERE piece_id = ? AND deleted_at IS NULL AND TRIM(alt) = ""')
    .bind(id)
    .first<{ n: number }>()
  if ((missing?.n ?? 0) > 0) return { ok: false, reason: 'Every image needs alt text before this piece can be published.' }
  await db().prepare("UPDATE pieces SET published=1, updated_at=datetime('now'), updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'publish', 'piece', id)
  return { ok: true }
}

export async function unpublishPiece(id: string, userId: string): Promise<void> {
  await db().prepare("UPDATE pieces SET published=0, updated_at=datetime('now'), updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'unpublish', 'piece', id)
}

export async function softDeletePiece(id: string, userId: string): Promise<void> {
  await db().prepare("UPDATE pieces SET deleted_at=datetime('now'), published=0, updated_by=? WHERE id=?").bind(userId, id).run()
  await audit(userId, 'delete', 'piece', id)
}
