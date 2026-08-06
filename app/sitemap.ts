import type { MetadataRoute } from 'next'
import { allCollectionParams, allPieceParams } from '@/lib/collections'
import { allJournalParams } from '@/lib/journal'

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://bansalsonsjewellers.com'

const STATIC = [
  '', '/legacy', '/maison', '/craftsmanship', '/bespoke',
  '/collections', '/journal', '/appointment', '/contact', '/privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cols, pieces, posts] = await Promise.all([allCollectionParams(), allPieceParams(), allJournalParams()])
  const url = (path: string): MetadataRoute.Sitemap[number] => ({ url: `${site}${path}`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 })

  return [
    ...STATIC.map(url),
    ...cols.map((c) => url(`/collections/${c.slug}`)),
    ...pieces.map((p) => url(`/collections/${p.slug}/${p.piece}`)),
    ...posts.map((p) => url(`/journal/${p.slug}`)),
  ]
}
