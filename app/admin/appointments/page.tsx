// /admin/appointments — enquiry list. Default new + newest first; filter by
// status and date range; CSV export. Loading the screen also runs the retention
// purge (≤ once/24h). Names + phone numbers live here — no-store (via middleware).
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listEnquiries, ENQ_STATUSES } from '@/lib/admin/enquiries-db'
import { runRetentionIfDue } from '@/lib/admin/retention'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Appointments', robots: { index: false, follow: false } }

function fmt(iso: string): string {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ status?: string; from?: string; to?: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  await runRetentionIfDue(session.user.id)

  const sp = await searchParams
  const status = sp.status ?? 'new'
  const rows = await listEnquiries({ status, from: sp.from, to: sp.to })
  const qs = new URLSearchParams({ status, ...(sp.from ? { from: sp.from } : {}), ...(sp.to ? { to: sp.to } : {}) }).toString()

  const chip = 'font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em]'
  const statusColor: Record<string, string> = { new: 'text-gold', contacted: 'text-[#3f7d3f]', booked: 'text-[#3f7d3f]', closed: 'text-stone' }

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Appointments</h1>
        <a href={`/admin/api/appointments/export?${qs}`} className="border border-hairline px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-charcoal hover:border-gold">
          Export CSV
        </a>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap items-end gap-3">
        <label className={`${chip} block text-stone`}>
          Status
          <select name="status" defaultValue={status} className="mt-1 block border border-hairline bg-white px-2 py-1.5 text-sm text-charcoal">
            {['all', ...ENQ_STATUSES].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={`${chip} block text-stone`}>From<input type="date" name="from" defaultValue={sp.from} className="mt-1 block border border-hairline bg-white px-2 py-1.5 text-sm text-charcoal" /></label>
        <label className={`${chip} block text-stone`}>To<input type="date" name="to" defaultValue={sp.to} className="mt-1 block border border-hairline bg-white px-2 py-1.5 text-sm text-charcoal" /></label>
        <button className="border border-gold px-4 py-1.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-obsidian">Filter</button>
      </form>

      <p className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-stone">{rows.length} enquir{rows.length === 1 ? 'y' : 'ies'}</p>

      <ul className="mt-3 divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
        {rows.length === 0 && <li className="py-8 text-stone">No enquiries in this view.</li>}
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/appointments/${r.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 py-4 hover:bg-pearl-deep/60 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <span className="min-w-0">
                <span className="block truncate font-[family-name:var(--font-display)]">{r.name}</span>
                <span className="block text-[0.7rem] text-stone">{r.phone}</span>
              </span>
              <span className="hidden text-[0.75rem] text-stone sm:block">{r.occasion ?? '—'}</span>
              <span className="hidden text-[0.75rem] text-stone sm:block">{r.preferred_date ?? '—'}</span>
              <span className={`${chip} ${statusColor[r.status] ?? 'text-stone'} justify-self-end`}>{r.status} · {fmt(r.submitted_at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminChrome>
  )
}
