// /admin/journal/:id — the editor host.
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getJournalPost } from '@/lib/admin/journal-db'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { JournalEditor } from '@/components/admin/JournalEditor'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit post', robots: { index: false, follow: false } }

export default async function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const { id } = await params
  const post = await getJournalPost(id)
  if (!post) notFound()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <JournalEditor post={post} csrf={session.csrf} />
    </AdminChrome>
  )
}
