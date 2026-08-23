import 'server-only'
// Image storage for the admin portal: R2 objects + the images table. Uploads are
// validated by MAGIC BYTES, never the filename or the client-sent MIME (docs/10
// § 5). The browser has already resized to WebP (2400 + 640); the worker just
// verifies and stores.
import { adminEnv } from './session'
import { audit } from './db'

export const MAX_BYTES = 8 * 1024 * 1024

function bucket(): R2Bucket {
  const b = adminEnv().BUCKET
  if (!b) throw new Error('R2 bucket (BUCKET) is not bound')
  return b
}
function db(): D1Database {
  return adminEnv().DB
}

/** Sniff real image type from the first bytes. Returns the MIME or null. */
export function sniffImage(buf: ArrayBuffer): string | null {
  const b = new Uint8Array(buf.slice(0, 16))
  // JPEG FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  // PNG 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png'
  // WEBP: 'RIFF' .... 'WEBP'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  return null
}

export async function putImage(
  entity: { type: string; id: string },
  full: ArrayBuffer,
  thumb: ArrayBuffer,
  dims: { width: number; height: number },
  userId: string,
): Promise<{ id: string; r2_key: string; r2_key_640: string; alt: string; is_cover: number; width: number; height: number; sort_order: number }> {
  const uuid = crypto.randomUUID()
  const key = `${entity.type}s/${entity.id}/${uuid}.webp`
  const key640 = `${entity.type}s/${entity.id}/${uuid}@640.webp`
  const meta = { httpMetadata: { contentType: 'image/webp' } }
  await bucket().put(key, full, meta)
  await bucket().put(key640, thumb, meta)

  const id = crypto.randomUUID()
  const pieceId = entity.type === 'piece' ? entity.id : null
  const next = await db().prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n, COUNT(*) AS c FROM images WHERE entity_type = ? AND entity_id = ? AND deleted_at IS NULL').bind(entity.type, entity.id).first<{ n: number; c: number }>()
  const sort = next?.n ?? 0
  const isCover = entity.type === 'piece' && (next?.c ?? 0) === 0 ? 1 : 0 // first piece image becomes its cover
  await db()
    .prepare('INSERT INTO images (id, piece_id, entity_type, entity_id, r2_key, r2_key_640, width, height, bytes, alt, sort_order, is_cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "", ?, ?)')
    .bind(id, pieceId, entity.type, entity.id, key, key640, dims.width, dims.height, full.byteLength, sort, isCover)
    .run()
  await audit(userId, 'create', 'image', id, { entity_type: entity.type, entity_id: entity.id })
  return { id, r2_key: key, r2_key_640: key640, alt: '', is_cover: isCover, width: dims.width, height: dims.height, sort_order: sort }
}

export async function updateImage(id: string, patch: { alt?: string; is_cover?: boolean }, userId: string): Promise<void> {
  if (patch.alt !== undefined) {
    await db().prepare('UPDATE images SET alt = ? WHERE id = ?').bind(patch.alt.trim(), id).run()
  }
  if (patch.is_cover) {
    const row = await db().prepare('SELECT piece_id FROM images WHERE id = ?').bind(id).first<{ piece_id: string }>()
    if (row) {
      await db().prepare('UPDATE images SET is_cover = 0 WHERE piece_id = ? AND deleted_at IS NULL').bind(row.piece_id).run()
      await db().prepare('UPDATE images SET is_cover = 1 WHERE id = ?').bind(id).run()
    }
  }
  await audit(userId, 'update', 'image', id, patch)
}

export async function deleteImage(id: string, userId: string): Promise<void> {
  const row = await db().prepare('SELECT r2_key, r2_key_640 FROM images WHERE id = ?').bind(id).first<{ r2_key: string; r2_key_640: string | null }>()
  await db().prepare("UPDATE images SET deleted_at = datetime('now') WHERE id = ?").bind(id).run()
  if (row) {
    await bucket().delete(row.r2_key).catch(() => {})
    if (row.r2_key_640) await bucket().delete(row.r2_key_640).catch(() => {})
  }
  await audit(userId, 'delete', 'image', id)
}

export async function reorderImages(pieceId: string, ids: string[], userId: string): Promise<void> {
  const stmt = db().prepare('UPDATE images SET sort_order = ? WHERE id = ? AND piece_id = ?')
  await db().batch(ids.map((id, i) => stmt.bind(i, id, pieceId)))
  await audit(userId, 'update', 'piece', pieceId, { reordered: ids.length })
}

export async function getObject(key: string) {
  return bucket().get(key)
}
