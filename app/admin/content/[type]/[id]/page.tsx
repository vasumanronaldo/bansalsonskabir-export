// /admin/content/:type/:id — create (id = 'new') or edit one row (11g). The
// form itself is the shared CollectionEditor.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { COLLECTIONS } from '@/lib/admin/collections'
import { getRow } from '@/lib/admin/collection-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { CollectionEditor } from '@/components/admin/CollectionEditor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'House content', robots: { index: false, follow: false } }

export default async function CollectionEdit({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params
  const c = COLLECTIONS[type]
  if (!c) notFound()
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')

  const isNew = id === 'new'
  const row = isNew ? null : await getRow(type, id)
  if (!isNew && !row) notFound()
  const backHref = `/admin/content/${type}`

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <Link href={backHref} className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone hover:text-gold">← {c.label}</Link>
      <h1 className="mt-1 mb-8 font-[family-name:var(--font-display)] text-3xl">{isNew ? `New ${c.singular}` : `Edit ${c.singular}`}</h1>
      <CollectionEditor type={type} fields={c.fields} row={row} csrf={session.csrf} backHref={backHref} singular={c.singular} />
    </AdminChrome>
  )
}
