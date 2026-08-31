// /admin/pages — all editable page content (docs/11 § 1). Short copy (headlines,
// ledes, proofs) as blocks, and the long-form essays/policies as documents. Both
// override the committed content and reset to it in one click.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { ensureBlocksSeeded, listBlocks } from '@/lib/admin/blocks-db'
import { listDocuments } from '@/lib/admin/documents-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { BlockEditor } from '@/components/admin/BlockEditor'
import { DocumentEditor } from '@/components/admin/DocumentEditor'
import { LABEL } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Page copy', robots: { index: false, follow: false } }

export default async function PagesAdmin() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  await ensureBlocksSeeded()
  const [blocks, docs] = await Promise.all([listBlocks(), listDocuments()])

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Page copy</h1>
      <p className="mt-2 max-w-2xl text-stone">The wording shown on the public pages. Change what you like — the original is always one click away.</p>

      <section className="mt-8">
        <p className={LABEL}>Headlines &amp; short copy</p>
        <div className="mt-3">
          <BlockEditor blocks={blocks} csrf={session.csrf} />
        </div>
      </section>

      <section className="mt-12">
        <p className={LABEL}>Long-form sections</p>
        <p className="mt-2 max-w-2xl text-sm text-stone">The essays and policies — the founder story, how a price is built, aftercare, commission terms and the privacy policy. Blank line starts a new paragraph.</p>
        <div className="mt-3">
          <DocumentEditor docs={docs} csrf={session.csrf} />
        </div>
      </section>
    </AdminChrome>
  )
}
