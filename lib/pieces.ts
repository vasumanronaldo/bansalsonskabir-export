import 'server-only'
// Featured pieces for the home page. Reads the admin's D1 catalogue when it has
// published pieces (so the homepage grid reflects what the family features), and
// falls back to the committed file content otherwise.
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getPieces } from './client-content'
import type { PieceCardData } from '@/components/blocks/PieceCard'

interface FilePiece {
  slug: string
  name: string
  collection: string
  images?: { src: string; alt: string }[]
}

interface DbRow { slug: string; name: string; col: string | null; cover_key: string | null; cover_alt: string | null }

async function d1<T>(sql: string, ...binds: unknown[]): Promise<T[] | null> {
  try {
    const { results } = await getCloudflareContext().env.DB.prepare(sql).bind(...binds).all<T>()
    return results ?? []
  } catch {
    return null
  }
}

const SELECT = `SELECT p.slug, p.name, c.slug AS col, i.r2_key_640 AS cover_key, i.alt AS cover_alt
  FROM pieces p
  LEFT JOIN collections c ON c.id = p.collection_id
  LEFT JOIN images i ON i.entity_type = 'piece' AND i.entity_id = p.id AND i.is_cover = 1 AND i.deleted_at IS NULL
  WHERE p.published = 1 AND p.deleted_at IS NULL AND c.slug IS NOT NULL`

export async function featuredPieces(limit = 6): Promise<PieceCardData[]> {
  // Any published pieces at all? If so, D1 is the source of truth.
  const anyPublished = await d1<{ x: number }>('SELECT 1 AS x FROM pieces WHERE published = 1 AND deleted_at IS NULL LIMIT 1')
  if (anyPublished && anyPublished.length) {
    // Prefer explicitly featured; if none are flagged, fall back to any published.
    let rows = await d1<DbRow>(`${SELECT} AND p.featured = 1 ORDER BY p.sort_order ASC, p.name ASC LIMIT ?`, limit)
    if (!rows || !rows.length) rows = await d1<DbRow>(`${SELECT} ORDER BY p.sort_order ASC, p.name ASC LIMIT ?`, limit)
    return (rows ?? []).map((p) => ({
      title: p.name,
      slug: p.slug,
      collectionSlug: p.col as string,
      placeholderLabel: p.name,
      photo: p.cover_key ? `/img/${p.cover_key}` : undefined,
      photoAlt: p.cover_alt || p.name,
    }))
  }

  const pieces = (getPieces().data.pieces as FilePiece[]) ?? []
  return pieces.slice(0, limit).map((p) => ({
    title: p.name,
    slug: p.slug,
    collectionSlug: p.collection,
    placeholderLabel: p.name,
    photo: p.images?.[0]?.src,
    photoAlt: p.images?.[0]?.alt,
  }))
}
