// /admin — the landing dashboard (docs/11 § 2). Five blocks, no charts, no vanity
// metrics. "Needs you" first: anything blocked, waiting or unanswered.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getDashboard, type ActivityRow } from '@/lib/admin/dashboard-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

function utc(s: string): Date {
  return new Date(s.replace(' ', 'T') + 'Z')
}
function ago(iso: string | null): string {
  if (!iso) return '—'
  const secs = Math.max(0, (Date.now() - utc(iso).getTime()) / 1000)
  if (secs < 90) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 90) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 36) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return `${Math.round(hrs / 24)} day${Math.round(hrs / 24) === 1 ? '' : 's'} ago`
}
function hm(iso: string): string {
  return utc(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
const VERB: Record<string, string> = { publish: 'published', unpublish: 'unpublished', create: 'added', update: 'updated', delete: 'deleted', export: 'exported', login: 'signed in' }
function activityLine(a: ActivityRow): string {
  const who = a.user ?? 'Someone'
  const verb = VERB[a.action] ?? a.action
  const what = a.label ? `“${a.label}”` : a.entity === 'enquiry' && a.action === 'export' ? 'a CSV of enquiries' : a.entity
  return `${who} ${verb} ${what}`
}

const H = 'font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-stone-light'
const CARD = 'border border-hairline-inv bg-charcoal/30 p-5'

export default async function AdminHome() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const d = await getDashboard()

  const needs: Array<{ text: string; href: string; note?: string }> = []
  if (d.newAppointments) needs.push({ text: `${d.newAppointments} new appointment request${d.newAppointments === 1 ? '' : 's'}`, href: '/admin/appointments?status=new' })
  if (d.piecesMissingAlt) needs.push({ text: `${d.piecesMissingAlt} piece${d.piecesMissingAlt === 1 ? '' : 's'} missing alt text`, href: '/admin/pieces', note: 'blocked from publishing' })
  if (d.journalDrafts) needs.push({ text: `${d.journalDrafts} journal post${d.journalDrafts === 1 ? '' : 's'} in draft`, href: '/admin/journal' })

  const action = 'border border-gold-soft px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian'

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Good to see you, {session.user.name.split(' ')[0]}.</h1>

      {/* NEEDS YOU */}
      <section className="mt-8">
        <p className={H}>Needs you</p>
        <div className={`mt-3 ${CARD}`}>
          {needs.length === 0 ? (
            <p className="text-stone-light">Nothing needs you right now.</p>
          ) : (
            <ul className="space-y-3">
              {needs.map((n) => (
                <li key={n.text}>
                  <Link href={n.href} className="flex items-center justify-between gap-4 hover:text-gold-soft">
                    <span>{n.text}{n.note && <span className="ml-2 text-[0.7rem] text-stone">· {n.note}</span>}</span>
                    <span className="text-gold-soft">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* THIS WEEK */}
        <section>
          <p className={H}>This week</p>
          <div className={`mt-3 ${CARD}`}>
            <div className="flex items-baseline justify-between"><span className="text-stone-light">Appointment requests</span><span className="font-[family-name:var(--font-display)] text-2xl">{d.weekAppointments}</span></div>
            <div className="mt-3 flex items-baseline justify-between"><span className="text-stone-light">Most recent</span><span>{ago(d.mostRecent)}</span></div>
          </div>
        </section>

        {/* UNPUBLISHED */}
        <section>
          <p className={H}>Unpublished</p>
          <div className={`mt-3 ${CARD} font-[family-name:var(--font-mono)] text-sm tracking-[0.06em]`}>
            Pieces {d.unpublished.pieces} · Journal {d.unpublished.journal} · Collections {d.unpublished.collections}
          </div>
        </section>
      </div>

      {/* QUICK ACTIONS */}
      <section className="mt-8">
        <p className={H}>Quick actions</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/pieces/new" className={action}>Add a piece</Link>
          <Link href="/admin/journal/new" className={action}>Write a journal post</Link>
          <Link href="/admin/media" className={action}>Photographs</Link>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="mt-8">
        <p className={H}>Recent activity</p>
        <ul className={`mt-3 ${CARD} space-y-2`}>
          {d.recent.length === 0 && <li className="text-stone-light">No activity yet.</li>}
          {d.recent.map((a, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-pearl">{activityLine(a)}</span>
              <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.7rem] text-stone">{hm(a.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </AdminChrome>
  )
}
