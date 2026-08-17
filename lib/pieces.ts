// Featured pieces for the home page. Prefers Sanity once configured; falls back
// to the file dummies (05-pieces.json) so the section renders in review before
// the CMS is live. Nothing is ever blocked on the client.
import { getPieces } from './client-content'
import { sanityConfigured } from '@/sanity/env'
import { getFeaturedPieces } from '@/sanity/queries'
import type { PieceCardData } from '@/components/blocks/PieceCard'

interface FilePiece {
  slug: string
  name: string
  collection: string
}

export async function featuredPieces(limit = 6): Promise<PieceCardData[]> {
  if (sanityConfigured) {
    const s = await getFeaturedPieces()
    if (s.length) {
      return s.slice(0, limit).map((p) => ({
        title: p.title,
        reference: p.reference,
        slug: p.slug,
        collectionSlug: p.collectionSlug ?? '',
        status: p.status,
        image: p.images?.[0] ?? null,
      }))
    }
  }
  const { data } = getPieces()
  const pieces = (data.pieces as FilePiece[]) ?? []
  return pieces.slice(0, limit).map((p) => ({
    title: p.name,
    slug: p.slug,
    collectionSlug: p.collection,
    placeholderLabel: p.name,
  }))
}
