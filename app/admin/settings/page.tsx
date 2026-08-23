// /admin/settings — the operational hub (docs/11 § 1 Settings). Business details,
// SEO overrides, and the operational tools (subscribers, audit, backup).
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { getSettingsForm, SEO_PAGES } from '@/lib/admin/settings-db'
import { SettingsEditor } from '@/components/admin/SettingsEditor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } }

const H = 'font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-stone-light'

export default async function SettingsPage() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const form = await getSettingsForm()

  const link = 'flex items-center justify-between gap-4 border border-hairline-inv bg-charcoal/30 px-5 py-4 transition-colors hover:border-gold-soft'

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Settings</h1>

      <section className="mt-8">
        <p className={H}>Business details &amp; SEO</p>
        <p className="mt-2 max-w-2xl text-sm text-stone-light">Contact, hours note and the search-result wording for each page. Blank fields fall back to the committed defaults.</p>
        <div className="mt-4">
          <SettingsEditor form={form} seoPages={SEO_PAGES} csrf={session.csrf} />
        </div>
      </section>

      <section className="mt-10">
        <p className={H}>Lists &amp; records</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/subscribers" className={link}><span>Newsletter subscribers</span><span className="text-gold-soft">→</span></Link>
          <Link href="/admin/audit" className={link}><span>Audit log</span><span className="text-gold-soft">→</span></Link>
          <Link href="/admin/security" className={link}><span>Two-factor authentication</span><span className="text-gold-soft">→</span></Link>
        </div>
      </section>

      <section className="mt-10">
        <p className={H}>Backup</p>
        <p className="mt-2 max-w-2xl text-sm text-stone-light">Downloads everything on the site — pieces, journal, appointments, subscribers and settings — as one JSON file. Keep it somewhere safe.</p>
        <a
          href="/admin/api/backup"
          className="mt-4 inline-block border border-gold-soft px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          Download full backup
        </a>
      </section>
    </AdminChrome>
  )
}
