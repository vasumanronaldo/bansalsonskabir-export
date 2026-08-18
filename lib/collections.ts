// Collections + pieces loader. Prefers Sanity once configured; falls back to the
// file content (04-collections.json, 05-pieces.json). Change round D: pieces are
// named pieces with prose — no maker's dossier, no reference code, no price.
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
  consentOnFile?: boolean
}

// A named piece as the page renders it (change round D3): name, subtitle, prose.
export interface PieceDetail {
  name: string
  subtitle?: string
  description?: string
  collectionSlug: string
  slug: string
}

function filePieces(): FilePiece[] {
  const { data } = getPieces()
  return (data.pieces as FilePiece[]) ?? []
}

function toCard(p: FilePiece): PieceCardData {
  return {
    title: p.name,
    slug: p.slug,
    collectionSlug: p.collection,
    placeholderLabel: p.name,
  }
}

// ── public API ──
export async function collectionsIndex(): Promise<CollectionCard[]> {
  const { data } = getCollectionsFile()
  const cols = (data.collections as FileCollection[]) ?? []
  return cols
    .slice()
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((c) => ({ _id: c.slug, title: c.title, slug: c.slug, order: c.order ?? null, shortDescription: c.shortDescription ?? null, heroImage: null }))
}

export async function collectionWithPieces(slug: string): Promise<{ collection: CollectionCard; intro: string | null; pieces: PieceCardData[] } | null> {
  const index = await collectionsIndex()
  const collection = index.find((c) => c.slug === slug)
  if (!collection) return null
  const { data } = getCollectionsFile()
  const file = ((data.collections as FileCollection[]) ?? []).find((c) => c.slug === slug)
  const pieces = filePieces().filter((p) => p.collection === slug).map(toCard)
  return { collection, intro: file?.introText ?? collection.shortDescription ?? null, pieces }
}

export async function pieceDetail(collectionSlug: string, pieceSlug: string): Promise<PieceDetail | null> {
  const p = filePieces().find((x) => x.collection === collectionSlug && x.slug === pieceSlug)
  if (!p) return null
  return { name: p.name, subtitle: p.subtitle, description: p.description, collectionSlug: p.collection, slug: p.slug }
}

export async function allCollectionParams(): Promise<{ slug: string }[]> {
  return (await collectionsIndex()).map((c) => ({ slug: c.slug }))
}

export async function allPieceParams(): Promise<{ slug: string; piece: string }[]> {
  return filePieces().map((p) => ({ slug: p.collection, piece: p.slug }))
}
