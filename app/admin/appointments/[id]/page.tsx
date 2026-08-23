// /admin/appointments/:id — one enquiry. Keyed on the opaque id only (no PII in
// the URL). WhatsApp + tel deep links, all fields, status + note.
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getEnquiry } from '@/lib/admin/enquiries-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { EnquiryActions } from '@/components/admin/EnquiryActions'
import { LinkArrow } from '@/components/ui/LinkArrow'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Enquiry', robots: { index: false, follow: false } }

function interestList(raw: string | null): string {
  if (!raw) return '—'
  try {
    const a = JSON.parse(raw)
    return Array.isArray(a) && a.length ? a.join(', ') : '—'
  } catch {
    return raw
  }
}

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const { id } = await params
  const e = await getEnquiry(id)
  if (!e) notFound()

  const digits = e.phone.replace(/\D/g, '')
  const wa = digits.length === 10 ? `91${digits}` : digits
  const rows: Array<[string, string]> = [
    ['Phone', e.phone],
    ['Email', e.email || '—'],
    ['Preferred', [e.preferred_date, e.preferred_time].filter(Boolean).join(', ') || '—'],
    ['Occasion', e.occasion || '—'],
    ['Interest', interestList(e.interest)],
    ['Budget', e.budget || '—'],
    ['Requirement', e.requirement || '—'],
    ['Contact via', e.contact_method || '—'],
    ['Submitted', e.submitted_at],
    ['Notified', e.notified_at || 'not sent'],
  ]
  const btn = 'inline-block border border-gold px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-obsidian'

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <LinkArrow href="/admin/appointments">Back to appointments</LinkArrow>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl">{e.name}</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`tel:${e.phone}`} className={btn}>Call</a>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={btn}>WhatsApp</a>
        {e.email && <a href={`mailto:${e.email}`} className={btn}>Email</a>}
      </div>

      <dl className="mt-8 max-w-xl">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 border-b border-[var(--color-hairline)] py-2.5">
            <dt className="w-32 shrink-0 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-stone">{k}</dt>
            <dd className="text-sm text-charcoal">{v}</dd>
          </div>
        ))}
      </dl>

      <EnquiryActions id={e.id} status={e.status} note={e.note} csrf={session.csrf} />
    </AdminChrome>
  )
}
