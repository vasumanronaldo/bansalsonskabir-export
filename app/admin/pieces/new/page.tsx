// /admin/pieces/new — just the name; create then drop into the editor.
import type { Metadata } from 'next'
import { requireSession } from '@/lib/admin/session'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'New piece', robots: { index: false, follow: false } }

export default async function NewPiecePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession()
  const { error } = await searchParams

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-2xl">New piece</h1>
      <form method="POST" action="/admin/api/pieces" className="mt-6 max-w-md">
        <input type="hidden" name="csrf" value={session.csrf} />
        <label className="block font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-stone">
          Name
          <input
            name="name"
            required
            autoFocus
            className="mt-2 block w-full border border-hairline bg-white px-3 py-2 text-charcoal outline-none focus:border-gold"
          />
        </label>
        {error && <p className="mt-3 text-sm text-[#a23a3a]">Enter a name to create the piece.</p>}
        <button
          type="submit"
          className="mt-6 border border-gold px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-obsidian"
        >
          Create &amp; edit
        </button>
      </form>
    </AdminChrome>
  )
}
