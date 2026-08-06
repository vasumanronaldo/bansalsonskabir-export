// Collections + pieces loader. Prefers Sanity once configured; falls back to the
// file dummies (04-collections.json, 05-pieces.json) so the whole section —
// index, lookbooks and the maker's dossier — renders before the CMS is live.
import { getCollections as getCollectionsFile, getPieces } from './client-content'
import { sanityConfigured } from '@/sanity/env'
import {
  getCollections as sanityCollections,
  type CollectionCard,
} from '@/sanity/queries'
import type { PieceCardData } from '@/components/blocks/PieceCard'

// ── file shapes ──
interface FileCollection {
  slug: string
  title: string
  order?: number
  shortDescription?: string
  introText?: string
}
interface FileStone {
  type?: string
  cut?: string
  count?: number
  carat?: number
  certifier?: string
  reportNumber?: string
  treatment?: string
}
interface FileDossier {
  grossWeight?: number
  netMetalWeight?: number
  benchHours?: number
  operations?: string[]
  outsourcedSteps?: Array<{ step?: string; reason?: string }>
  stones?: FileStone[]
  hallmark?: { bisMark?: boolean | string; huid?: string; assayedAt?: string | number }
  qcSignedOffBy?: string
  completedAt?: string | number
  serviceHistory?: Array<{ date?: string | number; work?: string; chargeable?: boolean }>
}
interface FilePiece {
  reference: string
  slug: string
  title: string
  collection: string
  metal?: string
  status?: string
  featured?: boolean
  isBespoke?: boolean
  placeholderLabel?: string
  description?: string
  dossier?: FileDossier
}

// ── normalized dossier the page renders ──
export interface NormalizedDossier {
  reference: string
  title: string
  collectionSlug: string
  slug: string
  status?: string
  isBespoke?: boolean
  placeholderLabel?: string
  completed?: string
  metal?: string
  grossWeight?: number
  netMetalWeight?: number
  stones?: FileStone[]
  operations?: string[]
  outsourced?: string[]
  benchHours?: number
  hallmark?: { bisMark?: string; huid?: string; assayedAt?: string }
  checkedBy?: string
  serviceHistory?: Array<{ date?: string; work?: string; chargeable?: boolean }>
  description?: string
}

const STATUS_LABEL: Record<string, string> = {
  sold: 'Sold',
  archive: 'Sold',
  inWorkshop: 'At the bench',
  available: 'Available',
}

/** Drop empty and unfilled ([TK]) values. */
const real = <T,>(v: T | undefined | null): T | undefined => {
  if (v == null) return undefined
  if (typeof v === 'string') {
    const t = v.trim()
    return t && t !== '[TK]' && !/^\[TK\]$/.test(t) ? (v as T) : undefined
  }
  return v
}
const str = (v: string | number | undefined) => (v == null ? undefined : real(String(v)))

function filePieces(): FilePiece[] {
  const { data } = getPieces()
  return (data.pieces as FilePiece[]) ?? []
}

function toCard(p: FilePiece): PieceCardData {
  return {
    title: p.title,
    reference: p.reference,
    slug: p.slug,
    collectionSlug: p.collection,
    status: p.status,
    placeholderLabel: p.placeholderLabel,
  }
}

function normalize(p: FilePiece): NormalizedDossier {
  const d = p.dossier ?? {}
  const outsourced = (d.outsourcedSteps ?? []).map((o) => o.step).filter((s): s is string => !!real(s))
  return {
    reference: p.reference,
    title: p.title,
    collectionSlug: p.collection,
    slug: p.slug,
    status: p.status ? STATUS_LABEL[p.status] ?? p.status : undefined,
    isBespoke: p.isBespoke,
    placeholderLabel: p.placeholderLabel,
    completed: str(d.completedAt),
    metal: real(p.metal),
    grossWeight: real(d.grossWeight),
    netMetalWeight: real(d.netMetalWeight),
    stones: (d.stones ?? []).filter((s) => real(s.type)),
    operations: (d.operations ?? []).filter((s) => real(s)),
    // outsourced: present array (even empty) means we can state the claim; empty → "None"
    outsourced: d.outsourcedSteps ? outsourced : undefined,
    benchHours: real(d.benchHours),
    hallmark: d.hallmark
      ? { bisMark: d.hallmark.bisMark === true ? 'BIS' : real(d.hallmark.bisMark as string), huid: real(d.hallmark.huid), assayedAt: str(d.hallmark.assayedAt) }
      : undefined,
    checkedBy: real(d.qcSignedOffBy),
    serviceHistory: (d.serviceHistory ?? [])
      .filter((s) => real(s.work))
      .map((s) => ({ date: str(s.date), work: s.work, chargeable: s.chargeable })),
    description: real(p.description),
  }
}

// ── public API ──
export async function collectionsIndex(): Promise<CollectionCard[]> {
  if (sanityConfigured) {
    const s = await sanityCollections()
    if (s.length) return s
  }
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

export async function pieceDossier(collectionSlug: string, pieceSlug: string): Promise<NormalizedDossier | null> {
  const p = filePieces().find((x) => x.collection === collectionSlug && x.slug === pieceSlug)
  return p ? normalize(p) : null
}

export async function allCollectionParams(): Promise<{ slug: string }[]> {
  return (await collectionsIndex()).map((c) => ({ slug: c.slug }))
}

export async function allPieceParams(): Promise<{ slug: string; piece: string }[]> {
  return filePieces().map((p) => ({ slug: p.collection, piece: p.slug }))
}
