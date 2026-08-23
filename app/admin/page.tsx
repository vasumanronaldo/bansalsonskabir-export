// /admin — the landing dashboard (docs/11 § 2). Luxury light layout: a welcome
// hero, gold stat cards, and "needs you" first. Every number is real and links
// to where you act on it — no vanity metrics, no invented sales figures.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getDashboard, type ActivityRow } from '@/lib/admin/dashboard-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { Card, StatCard, SectionHeader, ACTION, LABEL } from '@/components/admin/ui'

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

// Inline glyphs for the stat cards.
const G = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d={d} /></svg>
)

export default async function AdminHome() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const d = await getDashboard()

  const first = session.user.name.split(' ')[0]
  const istHour = (new Date().getUTCHours() + 5) % 24
  const greeting = istHour < 12 ? 'Good morning' : istHour < 17 ? 'Good afternoon' : 'Good evening'
  const unpublishedTotal = d.unpublished.pieces + d.unpublished.journal + d.unpublished.collections

  const needs: Array<{ text: string; href: string; note?: string }> = []
  if (d.newAppointments) needs.push({ text: `${d.newAppointments} new appointment request${d.newAppointments === 1 ? '' : 's'}`, href: '/admin/appointments?status=new', note: 'awaiting your reply' })
  if (d.piecesMissingAlt) needs.push({ text: `${d.piecesMissingAlt} piece${d.piecesMissingAlt === 1 ? '' : 's'} missing alt text`, href: '/admin/pieces', note: 'blocked from publishing' })
  if (d.journalDrafts) needs.push({ text: `${d.journalDrafts} journal post${d.journalDrafts === 1 ? '' : 's'} in draft`, href: '/admin/journal' })

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      {/* Welcome hero */}
      <section className="relative overflow-hidden rounded-2xl border border-hairline bg-gradient-to-r from-[#efe6d6] via-[#f4ede1] to-[#f4ede1] shadow-[0_1px_3px_rgba(42,35,26,0.05)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/photos/necklace-ruby.jpg" alt="" aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 object-cover opacity-70 sm:block [mask-image:linear-gradient(to_right,transparent,black_55%)]" />
        <div className="relative px-7 py-9 sm:px-9 sm:py-11">
          <p className={LABEL}>Welcome back</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2.4rem] leading-[1.05] text-charcoal sm:text-[2.9rem]">
            {greeting}, {first}.
          </h1>
          <p className="mt-2 max-w-md text-stone">Here&rsquo;s what&rsquo;s happening across the house today.</p>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New appointments" value={d.newAppointments} icon={G('M4 5h16v16H4zM4 9h16M8 3v4M16 3v4')} note={d.newAppointments ? <Link href="/admin/appointments?status=new" className="text-gold hover:underline">Awaiting your reply →</Link> : 'All caught up'} />
        <StatCard label="This week" value={d.weekAppointments} icon={G('M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zM12 7v5l3 2')} note={<>Requests · most recent {ago(d.mostRecent)}</>} />
        <StatCard label="Unpublished" value={unpublishedTotal} icon={G('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')} note={<>Pieces {d.unpublished.pieces} · Journal {d.unpublished.journal} · Collections {d.unpublished.collections}</>} />
        <StatCard label="Missing alt text" value={d.piecesMissingAlt} icon={G('M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6')} note={d.piecesMissingAlt ? <Link href="/admin/pieces" className="text-gold hover:underline">Add descriptions →</Link> : 'Every piece described'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Needs you + recent activity */}
        <div className="space-y-6">
          <div>
            <SectionHeader title="Needs you" />
            <Card>
              {needs.length === 0 ? (
                <p className="text-stone">Nothing needs you right now. Beautifully quiet.</p>
              ) : (
                <ul className="divide-y divide-hairline">
                  {needs.map((n, i) => (
                    <li key={n.text} className={i === 0 ? 'pb-3' : 'py-3 last:pb-0'}>
                      <Link href={n.href} className="group flex items-center justify-between gap-4">
                        <span className="text-charcoal">
                          {n.text}
                          {n.note && <span className="ml-2 text-[0.75rem] text-stone">· {n.note}</span>}
                        </span>
                        <span className="text-gold transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div>
            <SectionHeader title="Recent activity" />
            <Card className="!p-0">
              <ul className="divide-y divide-hairline">
                {d.recent.length === 0 && <li className="px-6 py-5 text-stone">No activity yet.</li>}
                {d.recent.map((a, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 px-6 py-3.5">
                    <span className="text-[0.9rem] text-charcoal">{activityLine(a)}</span>
                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.68rem] text-stone">{hm(a.at)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <SectionHeader title="Quick actions" />
          <Card className="space-y-3">
            <Link href="/admin/pieces/new" className={`${ACTION} w-full justify-center`}>Add a piece</Link>
            <Link href="/admin/journal/new" className={`${ACTION} w-full justify-center`}>Write a journal post</Link>
            <Link href="/admin/media" className={`${ACTION} w-full justify-center`}>Photographs</Link>
            <Link href="/admin/pages" className={`${ACTION} w-full justify-center`}>Edit page copy</Link>
          </Card>
        </div>
      </div>
    </AdminChrome>
  )
}
