// Featured pieces for the home page. Reads the file content directly — no
// per-request Sanity fetch, so the home page stays static and cheap on Workers.
import { getPieces } from './client-content'
import type { PieceCardData } from '@/components/blocks/PieceCard'

interface FilePiece {
  slug: string
  name: string
  collection: string
}

export async function featuredPieces(limit = 6): Promise<PieceCardData[]> {
  const { data } = getPieces()
  const pieces = (data.pieces as FilePiece[]) ?? []
  return pieces.slice(0, limit).map((p) => ({
    title: p.name,
    slug: p.slug,
    collectionSlug: p.collection,
    placeholderLabel: p.name,
  }))
}
