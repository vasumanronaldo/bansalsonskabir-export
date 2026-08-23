// /admin/audit — who changed what, when (docs/11 § 1). Read-only, filterable.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listAudit, auditFilters } from '@/lib/admin/audit-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Audit log', robots: { index: false, follow: false } }

function utc(s: string): Date {
  return new Date(s.replace(' ', 'T') + 'Z')
}
function when(iso: string): string {
  return utc(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
const VERB: Record<string, string> = { publish: 'published', unpublish: 'unpublished', create: 'added', update: 'updated', delete: 'deleted', export: 'exported', login: 'signed in' }

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ user?: string; entity?: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const sp = await searchParams
  const [rows, filters] = await Promise.all([listAudit({ user: sp.user, entity: sp.entity }), auditFilters()])

  const chip = (on: boolean) =>
    `px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] ${on ? 'text-gold border border-gold' : 'text-stone border border-hairline hover:text-charcoal'}`
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { user: sp.user, entity: sp.entity, ...patch }
    if (merged.user) p.set('user', merged.user)
    if (merged.entity) p.set('entity', merged.entity)
    const s = p.toString()
    return `/admin/audit${s ? `?${s}` : ''}`
  }

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Audit log</h1>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.2em] text-stone">Person</span>
          <Link href={qs({ user: undefined })} className={chip(!sp.user)}>Anyone</Link>
          {filters.users.map((u) => <Link key={u.id} href={qs({ user: u.id })} className={chip(sp.user === u.id)}>{u.name}</Link>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.2em] text-stone">Type</span>
          <Link href={qs({ entity: undefined })} className={chip(!sp.entity)}>Everything</Link>
          {filters.entities.map((e) => <Link key={e} href={qs({ entity: e })} className={chip(sp.entity === e)}>{e}</Link>)}
        </div>
      </div>

      <ul className="mt-6 border border-hairline bg-white">
        {rows.length === 0 && <li className="px-5 py-6 text-stone">No entries.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-4 border-b border-hairline px-5 py-3 text-sm last:border-b-0">
            <span className="text-charcoal">
              <span className="text-stone">{r.user ?? 'System'}</span> {VERB[r.action] ?? r.action}{' '}
              <span className="font-[family-name:var(--font-mono)] text-[0.72rem] tracking-[0.06em] text-stone">{r.entity}</span>
              {r.entity_id && r.entity_id !== 'csv' && r.entity_id !== 'json' && <span className="text-stone"> · {r.entity_id.slice(0, 8)}</span>}
            </span>
            <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.68rem] text-stone">{when(r.at)}</span>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
