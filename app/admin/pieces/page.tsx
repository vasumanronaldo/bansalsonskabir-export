// /admin/pieces — the list. Cover thumb, name, collection, published, updated.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listPieces } from '@/lib/admin/db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pieces', robots: { index: false, follow: false } }

export default async function PiecesPage() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const pieces = await listPieces()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Pieces</h1>
        <Link
          href="/admin/pieces/new"
          className="border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          New piece
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-[var(--color-hairline-inv)] border-y border-[var(--color-hairline-inv)]">
        {pieces.length === 0 && <li className="py-8 text-stone-light">No pieces yet. Create the first one.</li>}
        {pieces.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/pieces/${p.id}`} className="flex items-center gap-4 py-4 hover:bg-charcoal/40">
              <span className="h-14 w-14 shrink-0 overflow-hidden bg-charcoal">
                {p.cover_key_640 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/img/${p.cover_key_640}`} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-[family-name:var(--font-display)]">{p.name}</span>
                <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-stone-light">{p.collection_title ?? 'No collection'}</span>
              </span>
              <span
                className={`font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] ${p.published ? 'text-[#8fbf8f]' : 'text-stone-light'}`}
              >
                {p.published ? 'Published' : 'Draft'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
