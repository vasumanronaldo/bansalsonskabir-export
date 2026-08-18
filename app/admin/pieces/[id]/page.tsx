// /admin/pieces/:id — the editor. Loads the piece + collections from D1 and
// hands them to the client editor.
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getPiece, collectionOptions } from '@/lib/admin/db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { PieceEditor } from '@/components/admin/PieceEditor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit piece', robots: { index: false, follow: false } }

export default async function EditPiecePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const { id } = await params
  const [piece, collections] = await Promise.all([getPiece(id), collectionOptions()])
  if (!piece) notFound()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <PieceEditor piece={piece} collections={collections} csrf={session.csrf} />
    </AdminChrome>
  )
}
