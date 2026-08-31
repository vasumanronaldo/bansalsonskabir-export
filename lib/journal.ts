// Journal loader — reads published posts from D1 (managed in /admin/journal).
// The pages that use these are force-dynamic; allJournalParams returns [] so the
// build-time sitemap never touches D1 (posts are served on demand instead).
import { readRows, readRow } from '@/lib/site-db'
import type { JournalCardData, JournalPostData } from '@/lib/journal-shared'

export { JOURNAL_CATEGORIES } from '@/lib/journal-shared'
export type { JournalCardData, JournalPostData } from '@/lib/journal-shared'

type Row = { id: string; title: string; slug: string; excerpt: string | null; category: string | null; published_at: string | null; cover_key: string | null; cover_alt: string | null }
function card(r: Row): JournalCardData {
  return {
    _id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt, category: r.category, publishedAt: r.published_at,
    coverSrc: r.cover_key ? `/img/${r.cover_key}` : null, coverAlt: r.cover_alt || r.title,
  }
}

export async function journalIndex(): Promise<JournalCardData[]> {
  const results = await readRows<Row>(
    `SELECT j.id, j.title, j.slug, j.excerpt, j.category, j.published_at, i.r2_key_640 AS cover_key, i.alt AS cover_alt
       FROM journal_posts j LEFT JOIN images i ON j.cover_image_id = i.id
      WHERE j.published = 1 AND j.deleted_at IS NULL
      ORDER BY j.published_at DESC`,
  )
  return (results ?? []).map(card)
}

export async function journalPost(slug: string): Promise<JournalPostData | null> {
  const r = await readRow<Row & { body: string; author: string; seo_title: string; seo_description: string }>(
    `SELECT j.id, j.title, j.slug, j.excerpt, j.category, j.published_at, j.body, j.author, j.seo_title, j.seo_description,
            i.r2_key AS cover_key, i.alt AS cover_alt
       FROM journal_posts j LEFT JOIN images i ON j.cover_image_id = i.id
      WHERE j.slug = ? AND j.published = 1 AND j.deleted_at IS NULL`,
    slug,
  )
  if (!r) return null
  return { ...card(r), body: r.body, author: r.author, seoTitle: r.seo_title, seoDescription: r.seo_description }
}

export async function relatedPosts(category: string | null, excludeSlug: string, n = 3): Promise<JournalCardData[]> {
  const all = await journalIndex()
  return all.filter((p) => p.slug !== excludeSlug && (!category || p.category === category)).slice(0, n)
}

export async function allJournalParams(): Promise<{ slug: string }[]> {
  return []
}
