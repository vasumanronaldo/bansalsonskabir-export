// Journal loader. Journal content was Sanity-only and none is published, so the
// reads return empty and the pages render their graceful empty state. Kept out of
// the request path entirely (no per-request Sanity fetch) so the pages stay static
// and cheap on Workers. Wire to D1 alongside the rest of the content later.
import type { JournalCard, ImageRef } from '@/sanity/queries'

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
  return []
}

export async function journalPost(_slug: string): Promise<JournalPostFull | null> {
  return null
}

export async function relatedPosts(_category: string | null, _excludeSlug: string, _n = 3): Promise<JournalCard[]> {
  return []
}

export async function allJournalParams(): Promise<{ slug: string }[]> {
  return []
}

export type { JournalCard, ImageRef }
