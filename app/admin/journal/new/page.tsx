// /admin/journal/new — title only; create then open the editor.
import type { Metadata } from 'next'
import { requireSession } from '@/lib/admin/session'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New post', robots: { index: false, follow: false } }

export default async function NewJournalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession()
  const { error } = await searchParams
  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-2xl">New journal post</h1>
      <form method="POST" action="/admin/api/journal" className="mt-6 max-w-md">
        <input type="hidden" name="csrf" value={session.csrf} />
        <label className="block font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-stone-light">
          Title
          <input name="title" required autoFocus className="mt-2 block w-full border border-hairline-inv bg-charcoal px-3 py-2 text-pearl outline-none focus:border-gold-soft" />
        </label>
        {error && <p className="mt-3 text-sm text-[#e6b0b0]">Enter a title to create the post.</p>}
        <button type="submit" className="mt-6 border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian">
          Create &amp; edit
        </button>
      </form>
    </AdminChrome>
  )
}
