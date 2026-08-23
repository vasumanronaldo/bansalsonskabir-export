// /admin/content — the four house-content collections (11g). Seeds each from the
// committed content on first visit, then shows a card per type with its count.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { COLLECTIONS, COLLECTION_TYPES } from '@/lib/admin/collections'
import { ensureCollectionSeeded, countCollection } from '@/lib/admin/collection-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'House content', robots: { index: false, follow: false } }

export default async function ContentIndex() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')

  const cards = await Promise.all(
    COLLECTION_TYPES.map(async (type) => {
      await ensureCollectionSeeded(type)
      return { c: COLLECTIONS[type]!, count: await countCollection(type) }
    }),
  )

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">House content</h1>
      <p className="mt-2 max-w-2xl text-stone">The living parts of the site — the story, the process, the people, the questions people ask.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {cards.map(({ c, count }) => (
          <Link key={c.type} href={`/admin/content/${c.type}`} className="group border border-hairline bg-white p-6 transition-colors hover:border-gold">
            <div className="flex items-baseline justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl group-hover:text-gold">{c.label}</h2>
              <span className="font-[family-name:var(--font-mono)] text-sm text-stone">{count}</span>
            </div>
            <p className="mt-2 text-sm text-stone">Drives {c.drives}.</p>
          </Link>
        ))}
      </div>
    </AdminChrome>
  )
}
