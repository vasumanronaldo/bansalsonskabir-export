import 'server-only'
// Collections + pieces loader. Reads the admin's D1 catalogue when it has data
// (so edits in the admin drive the public pages), and falls back to the committed
// file content (04-collections.json, 05-pieces.json) when D1 is empty or
// unavailable. Pieces are named pieces with prose — no price, no reference code.
import { readRows as d1 } from './site-db'
import { getCollections as getCollectionsFile, getPieces } from './client-content'
import type { CollectionCard } from '@/sanity/queries'
import type { PieceCardData } from '@/components/blocks/PieceCard'

interface FileCollection {
  slug: string
  title: string
  order?: number
  shortDescription?: string
  introText?: string
}
interface FilePiece {
  slug: string
  name: string
  subtitle?: string
  collection: string
  description?: string
}

export interface PieceImage {
  src: string
  alt: string
  width?: number
  height?: number
}
export interface PieceDetail {
  name: string
  subtitle?: string
  description?: string
  collectionSlug: string
  slug: string
  images: PieceImage[]
}

// D1 access goes through the shared reader (lib/site-db); null = fall back to file.
interface DbCollection { slug: string; title: string; intro: string; sort_order: number; published: number }
interface DbPieceCard { slug: string; name: string; cover_key: string | null; cover_alt: string | null }

const toCard = (p: DbPieceCard, collectionSlug: string): PieceCardData => ({
  title: p.name,
  slug: p.slug,
  collectionSlug,
  placeholderLabel: p.name,
  photo: p.cover_key ? `/img/${p.cover_key}` : undefined,
  photoAlt: p.cover_alt || p.name,
})

const fileToCard = (p: FilePiece): PieceCardData => ({
  title: p.name,
  slug: p.slug,
  collectionSlug: p.collection,
  placeholderLabel: p.name,
})

function filePieces(): FilePiece[] {
  return (getPieces().data.pieces as FilePiece[]) ?? []
}

// ── public API ──
export async function collectionsIndex(): Promise<CollectionCard[]> {
  const rows = await d1<DbCollection>('SELECT slug, title, intro, sort_order, published FROM collections ORDER BY sort_order ASC, title ASC')
  if (rows && rows.length) {
    return rows.filter((c) => c.published).map((c) => ({ _id: c.slug, title: c.title, slug: c.slug, order: c.sort_order, shortDescription: c.intro || null, heroImage: null }))
  }
  const cols = (getCollectionsFile().data.collections as FileCollection[]) ?? []
  return cols
    .slice()
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((c) => ({ _id: c.slug, title: c.title, slug: c.slug, order: c.order ?? null, shortDescription: c.shortDescription ?? null, heroImage: null }))
}

export async function collectionWithPieces(slug: string): Promise<{ collection: CollectionCard; intro: string | null; pieces: PieceCardData[] } | null> {
  const cols = await d1<DbCollection>('SELECT slug, title, intro, sort_order, published FROM collections ORDER BY sort_order ASC')
  if (cols && cols.length) {
    const col = cols.find((c) => c.slug === slug && c.published)
    if (!col) return null
    const pieces = await d1<DbPieceCard>(
      `SELECT p.slug, p.name, i.r2_key_640 AS cover_key, i.alt AS cover_alt
         FROM pieces p
         LEFT JOIN images i ON i.entity_type = 'piece' AND i.entity_id = p.id AND i.is_cover = 1 AND i.deleted_at IS NULL
        WHERE p.collection_id = (SELECT id FROM collections WHERE slug = ?) AND p.published = 1 AND p.deleted_at IS NULL
        ORDER BY p.sort_order ASC, p.name ASC`,
      slug,
    )
    return {
      collection: { _id: col.slug, title: col.title, slug: col.slug, order: col.sort_order, shortDescription: col.intro || null, heroImage: null },
      intro: col.intro || null,
      pieces: (pieces ?? []).map((p) => toCard(p, slug)),
    }
  }

  // file fallback
  const index = await collectionsIndex()
  const collection = index.find((c) => c.slug === slug)
  if (!collection) return null
  const file = ((getCollectionsFile().data.collections as FileCollection[]) ?? []).find((c) => c.slug === slug)
  return { collection, intro: file?.introText ?? collection.shortDescription ?? null, pieces: filePieces().filter((p) => p.collection === slug).map(fileToCard) }
}

export async function pieceDetail(collectionSlug: string, pieceSlug: string): Promise<PieceDetail | null> {
  const any = await d1<{ x: number }>('SELECT 1 AS x FROM pieces WHERE deleted_at IS NULL LIMIT 1')
  if (any && any.length) {
    const rows = await d1<{ id: string; name: string; subtitle: string; description: string; col: string | null }>(
      `SELECT p.id, p.name, p.subtitle, p.description, c.slug AS col
         FROM pieces p LEFT JOIN collections c ON c.id = p.collection_id
        WHERE p.slug = ? AND p.published = 1 AND p.deleted_at IS NULL`,
      pieceSlug,
    )
    const p = rows?.[0]
    if (!p || p.col !== collectionSlug) return null
    const imgs = await d1<{ r2_key: string; alt: string; width: number; height: number }>(
      `SELECT r2_key, alt, width, height FROM images
        WHERE entity_type = 'piece' AND entity_id = ? AND deleted_at IS NULL
        ORDER BY is_cover DESC, sort_order ASC`,
      p.id,
    )
    return {
      name: p.name,
      subtitle: p.subtitle || undefined,
      description: p.description || undefined,
      collectionSlug,
      slug: pieceSlug,
      images: (imgs ?? []).map((i) => ({ src: `/img/${i.r2_key}`, alt: i.alt || p.name, width: i.width, height: i.height })),
    }
  }

  const p = filePieces().find((x) => x.collection === collectionSlug && x.slug === pieceSlug)
  if (!p) return null
  return { name: p.name, subtitle: p.subtitle, description: p.description, collectionSlug: p.collection, slug: p.slug, images: [] }
}

export async function allCollectionParams(): Promise<{ slug: string }[]> {
  return (await collectionsIndex()).map((c) => ({ slug: c.slug }))
}

export async function allPieceParams(): Promise<{ slug: string; piece: string }[]> {
  const rows = await d1<{ col: string | null; slug: string }>(
    `SELECT c.slug AS col, p.slug FROM pieces p LEFT JOIN collections c ON c.id = p.collection_id WHERE p.published = 1 AND p.deleted_at IS NULL AND c.slug IS NOT NULL`,
  )
  if (rows && rows.length) return rows.map((r) => ({ slug: r.col as string, piece: r.slug }))
  return filePieces().map((p) => ({ slug: p.collection, piece: p.slug }))
}
