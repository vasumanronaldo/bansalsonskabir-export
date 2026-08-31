// Journal constants + types shared by the server reader (lib/journal) and the
// client editor/index. No server-only imports, so it is safe in the client bundle.
export const JOURNAL_CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'craft', label: 'Craft' },
  { value: 'house', label: 'The House' },
  { value: 'guides', label: 'Guides' },
] as const

export interface JournalCardData {
  _id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  publishedAt: string | null
  coverSrc: string | null
  coverAlt: string
}
export interface JournalPostData extends JournalCardData {
  body: string
  author: string
  seoTitle: string
  seoDescription: string
}
