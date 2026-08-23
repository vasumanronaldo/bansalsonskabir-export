import 'server-only'
// Media library data. Every uploaded image, with where it's used resolved, so the
// screen can show usage and block deletion of in-use images. Images arrive via the
// existing Phase-10 upload path (piece editor) — this is the shared view over them.
import { adminEnv } from './session'

export interface MediaItem {
  id: string
  r2_key: string
  r2_key_640: string | null
  alt: string
  width: number
  height: number
  bytes: number
  entity_type: string
  entity_id: string | null
  created_at: string
  usage: string // human label of where it's used, or 'Unused'
  inUse: boolean // blocks deletion when true
}

export async function listMedia(): Promise<MediaItem[]> {
  const { results } = await adminEnv()
    .DB.prepare(
      `SELECT i.id, i.r2_key, i.r2_key_640, i.alt, i.width, i.height, i.bytes,
              i.entity_type, i.entity_id, i.created_at,
              p.name AS piece_name, p.deleted_at AS piece_deleted,
              j.title AS journal_title, j.deleted_at AS journal_deleted
         FROM images i
         LEFT JOIN pieces p        ON i.entity_type = 'piece'   AND i.entity_id = p.id
         LEFT JOIN journal_posts j ON i.entity_type = 'journal' AND i.entity_id = j.id
        WHERE i.deleted_at IS NULL
        ORDER BY i.created_at DESC`,
    )
    .all<{
      id: string; r2_key: string; r2_key_640: string | null; alt: string; width: number; height: number; bytes: number
      entity_type: string; entity_id: string | null; created_at: string
      piece_name: string | null; piece_deleted: string | null; journal_title: string | null; journal_deleted: string | null
    }>()

  return (results ?? []).map((r) => {
    let usage = 'Unused'
    let inUse = false
    if (r.entity_type === 'piece' && r.piece_name && !r.piece_deleted) {
      usage = `Piece — ${r.piece_name}`
      inUse = true
    } else if (r.entity_type === 'journal' && r.journal_title && !r.journal_deleted) {
      usage = `Journal — ${r.journal_title}`
      inUse = true
    } else if (r.entity_type === 'page' && r.entity_id) {
      usage = `Page — ${r.entity_id}`
      inUse = true
    }
    return {
      id: r.id, r2_key: r.r2_key, r2_key_640: r.r2_key_640, alt: r.alt, width: r.width, height: r.height,
      bytes: r.bytes, entity_type: r.entity_type, entity_id: r.entity_id, created_at: r.created_at, usage, inUse,
    }
  })
}

/** True when the image is still referenced by a live entity — deletion is blocked. */
export async function isImageInUse(id: string): Promise<boolean> {
  const row = await adminEnv()
    .DB.prepare(
      `SELECT i.entity_type, i.entity_id, p.deleted_at AS piece_deleted, j.deleted_at AS journal_deleted
         FROM images i
         LEFT JOIN pieces p        ON i.entity_type = 'piece'   AND i.entity_id = p.id
         LEFT JOIN journal_posts j ON i.entity_type = 'journal' AND i.entity_id = j.id
        WHERE i.id = ? AND i.deleted_at IS NULL`,
    )
    .bind(id)
    .first<{ entity_type: string; entity_id: string | null; piece_deleted: string | null; journal_deleted: string | null }>()
  if (!row || !row.entity_id) return false
  if (row.entity_type === 'piece') return row.piece_deleted == null
  if (row.entity_type === 'journal') return row.journal_deleted == null
  if (row.entity_type === 'page') return true
  return false
}
