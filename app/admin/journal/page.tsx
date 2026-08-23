// /admin/journal — the post list.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listJournal } from '@/lib/admin/journal-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Journal', robots: { index: false, follow: false } }

export default async function JournalListPage() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const posts = await listJournal()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Journal</h1>
        <Link href="/admin/journal/new" className="border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian">
          New post
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-[var(--color-hairline-inv)] border-y border-[var(--color-hairline-inv)]">
        {posts.length === 0 && <li className="py-8 text-stone-light">No posts yet.</li>}
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/journal/${p.id}`} className="flex items-center gap-4 py-4 hover:bg-charcoal/40">
              <span className="h-14 w-20 shrink-0 overflow-hidden bg-charcoal">
                {p.cover_key_640 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/img/${p.cover_key_640}`} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-[family-name:var(--font-display)]">{p.title}</span>
                <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-stone-light">{p.category}</span>
              </span>
              <span className={`font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] ${p.published ? 'text-[#8fbf8f]' : 'text-stone-light'}`}>
                {p.published ? 'Published' : 'Draft'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
