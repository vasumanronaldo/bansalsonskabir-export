// /admin/content/:type — list one collection (11g). Rows link to the shared
// editor; "Add" opens a blank one. Seeds on load so the list is never empty on
// first visit.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { COLLECTIONS } from '@/lib/admin/collections'
import { ensureCollectionSeeded, listCollection } from '@/lib/admin/collection-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'House content', robots: { index: false, follow: false } }

export default async function CollectionList({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const c = COLLECTIONS[type]
  if (!c) notFound()
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  await ensureCollectionSeeded(type)
  const rows = await listCollection(type)

  const action = 'border border-gold px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-obsidian'

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/content" className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone hover:text-gold">← House content</Link>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">{c.label}</h1>
        </div>
        <Link href={`/admin/content/${type}/new`} className={action}>Add {c.singular}</Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-stone">Drives {c.drives}.</p>

      <ul className="mt-8 border border-hairline bg-white">
        {rows.length === 0 && <li className="px-5 py-6 text-stone">Nothing here yet.</li>}
        {rows.map((r) => (
          <li key={String(r.id)} className="border-b border-hairline last:border-b-0">
            <Link href={`/admin/content/${type}/${r.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-pearl-deep/60">
              <span className="flex items-baseline gap-3">
                {c.subtitleField && r[c.subtitleField] != null && r[c.subtitleField] !== '' && (
                  <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-stone">{String(r[c.subtitleField])}</span>
                )}
                <span className="text-charcoal">{String(r[c.titleField] ?? '—')}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {'published' in r && r.published === 0 && <span className="font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-stone">Hidden</span>}
                {'consent_on_file' in r && r.consent_on_file === 0 && <span className="font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-[#a23a3a]">No consent</span>}
                <span className="text-gold">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
