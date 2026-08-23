// /admin/pages — editable page copy (docs/11 § 1). Self-seeds the registry on
// load, then lists every block grouped by page. Edits override the committed
// default; reset restores it.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { ensureBlocksSeeded, listBlocks } from '@/lib/admin/blocks-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { BlockEditor } from '@/components/admin/BlockEditor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Page copy', robots: { index: false, follow: false } }

export default async function PagesAdmin() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  await ensureBlocksSeeded()
  const blocks = await listBlocks()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Page copy</h1>
      <p className="mt-2 max-w-2xl text-stone-light">The wording shown on the public pages. Change what you like — the original is always one click away.</p>
      <div className="mt-8">
        <BlockEditor blocks={blocks} csrf={session.csrf} />
      </div>
    </AdminChrome>
  )
}
