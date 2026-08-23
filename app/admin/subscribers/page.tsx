// /admin/subscribers — newsletter list (docs/11 § 1). Filter by status, export CSV.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listSubscribers, subscriberCounts } from '@/lib/admin/subscribers-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Subscribers', robots: { index: false, follow: false } }

const STATUSES = ['all', 'confirmed', 'pending', 'unsubscribed'] as const

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const { status = 'confirmed' } = await searchParams
  const active = (STATUSES as readonly string[]).includes(status) ? status : 'confirmed'
  const [rows, counts] = await Promise.all([listSubscribers(active), subscriberCounts()])

  const tab = (s: string) =>
    `px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] ${s === active ? 'text-gold-soft border-b border-gold-soft' : 'text-stone-light hover:text-pearl'}`

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Subscribers</h1>
        <a
          href={`/admin/api/subscribers/export?status=${active}`}
          className="border border-gold-soft px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 flex gap-2 border-b border-hairline-inv">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/subscribers?status=${s}`} className={tab(s)}>
            {s}{s !== 'all' && ` (${counts[s] ?? 0})`}
          </Link>
        ))}
      </div>

      <ul className="mt-6 border border-hairline-inv bg-charcoal/20">
        {rows.length === 0 && <li className="px-5 py-6 text-stone-light">No subscribers here.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 border-b border-hairline-inv px-5 py-3 last:border-b-0">
            <span className="text-pearl">{r.email}</span>
            <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-stone-light">{r.status}</span>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
