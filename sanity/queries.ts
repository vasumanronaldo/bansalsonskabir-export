// GROQ queries with typed returns (docs/03). Pages call these through the
// client; they never build queries inline. Every query is jurisdiction-free —
// content only. No price field is ever selected because none exists.
import { groq } from 'next-sanity'
import { client } from './lib/client'
import { sanityConfigured } from './env'

// ── Types ──────────────────────────────────────────────────────────────────
export interface ImageRef {
  asset?: { _ref: string }
  hotspot?: { x: number; y: number }
  alt?: string
}
export interface CollectionCard {
  _id: string
  title: string
  slug: string
  order: number | null
  shortDescription: string | null
  heroImage: ImageRef | null
}
export interface PieceCard {
  _id: string
  reference: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  images: ImageRef[] | null
  collectionSlug: string | null
}
export interface Dossier {
  grossWeight?: number
  netMetalWeight?: number
  metals?: Array<{ karat?: string; colour?: string; weight?: number }>
  stones?: Array<{ type?: string; cut?: string; count?: number; carat?: number; certifier?: string; reportNumber?: string; treatment?: string; treatmentDisclosedAt?: string }>
  operations?: Array<{ step?: string; performedBy?: string; hours?: number }>
  benchHours?: number
  outsourcedSteps?: Array<{ step?: string; reason?: string }>
  hallmark?: { bisMark?: string; huid?: string; assayedAt?: string }
  qcSignedOffBy?: string
  completedAt?: string
  serviceHistory?: Array<{ date?: string; work?: string; chargeable?: boolean }>
}
export interface PieceFull extends PieceCard {
  description: unknown[] | null
  isBespoke: boolean
  consentOnFile: boolean
  dossier: Dossier | null
}
export interface JournalCard {
  _id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  publishedAt: string | null
  coverImage: ImageRef | null
}

// ── Query strings ────────────────────────────────────────────────────────
export const collectionsQuery = groq`*[_type == "collection"] | order(order asc){
  _id, title, "slug": slug.current, order, shortDescription, heroImage
}`

export const collectionBySlugQuery = groq`*[_type == "collection" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, shortDescription, introText, heroImage,
  "pieces": *[_type == "piece" && references(^._id)]{
    _id, reference, title, "slug": slug.current, category, status, featured, images,
    "collectionSlug": ^.slug.current
  }
}`

export const pieceQuery = groq`*[_type == "piece" && slug.current == $piece && collection->slug.current == $slug][0]{
  _id, reference, title, "slug": slug.current, category, status, featured, images,
  description, isBespoke, consentOnFile, dossier,
  "collectionSlug": collection->slug.current
}`

export const allPieceParamsQuery = groq`*[_type == "piece" && defined(slug.current) && defined(collection->slug.current)]{
  "slug": collection->slug.current, "piece": slug.current
}`

export const allCollectionSlugsQuery = groq`*[_type == "collection" && defined(slug.current)].slug.current`

export const featuredPiecesQuery = groq`*[_type == "piece" && featured == true] | order(publishedAt desc)[0...6]{
  _id, reference, title, "slug": slug.current, category, status, featured, images,
  "collectionSlug": collection->slug.current
}`

export const journalIndexQuery = groq`*[_type == "journalPost"] | order(publishedAt desc){
  _id, title, "slug": slug.current, excerpt, category, publishedAt, coverImage
}`

export const journalBySlugQuery = groq`*[_type == "journalPost" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, excerpt, category, publishedAt, coverImage, body, author, seo
}`

export const timelineQuery = groq`*[_type == "timelineEvent"] | order(year asc){ _id, year, title, description, image }`
export const processQuery = groq`*[_type == "processStep"] | order(order asc){ _id, order, title, description, image }`
export const faqQuery = groq`*[_type == "faq"]{ _id, question, answer, group }`

// ── Fetch helpers (return empty when Sanity isn't configured yet) ──────────
async function safeFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
  if (!sanityConfigured) return fallback
  try {
    return await client.fetch<T>(query, params)
  } catch {
    return fallback
  }
}

export const getCollections = () => safeFetch<CollectionCard[]>(collectionsQuery, {}, [])
export const getFeaturedPieces = () => safeFetch<PieceCard[]>(featuredPiecesQuery, {}, [])
export const getJournalIndex = () => safeFetch<JournalCard[]>(journalIndexQuery, {}, [])
