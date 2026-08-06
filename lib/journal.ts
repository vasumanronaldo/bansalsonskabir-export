// Journal loader. Journal content lives only in Sanity (no file dummies), so the
// index is empty until the CMS is connected — the pages render a graceful empty
// state meanwhile, and light up automatically once posts exist.
import { sanityConfigured } from '@/sanity/env'
import { client } from '@/sanity/lib/client'
import { getJournalIndex as sanityIndex, journalBySlugQuery, type JournalCard, type ImageRef } from '@/sanity/queries'

export const JOURNAL_CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'craft', label: 'Craft' },
  { value: 'house', label: 'The House' },
  { value: 'guides', label: 'Guides' },
] as const

export interface JournalPostFull extends JournalCard {
  body: unknown[] | null
  author: string | null
  seo?: { title?: string; description?: string } | null
}

export async function journalIndex(): Promise<JournalCard[]> {
  if (!sanityConfigured) return []
  return sanityIndex()
}

export async function journalPost(slug: string): Promise<JournalPostFull | null> {
  if (!sanityConfigured) return null
  return client.fetch<JournalPostFull | null>(journalBySlugQuery, { slug }).catch(() => null)
}

export async function relatedPosts(category: string | null, excludeSlug: string, n = 3): Promise<JournalCard[]> {
  const all = await journalIndex()
  return all.filter((p) => p.slug !== excludeSlug && (!category || p.category === category)).slice(0, n)
}

export async function allJournalParams(): Promise<{ slug: string }[]> {
  return (await journalIndex()).map((p) => ({ slug: p.slug }))
}

export type { JournalCard, ImageRef }
