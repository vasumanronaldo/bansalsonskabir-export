// /admin/media — the media library. Every uploaded image, grid view, search by
// filename + alt, usage shown, deletion blocked when in use.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { listMedia } from '@/lib/admin/media'
import { AdminChrome } from '@/components/admin/AdminChrome'
import { MediaLibrary } from '@/components/admin/MediaLibrary'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Media', robots: { index: false, follow: false } }

export default async function MediaPage() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const items = await listMedia()

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <MediaLibrary items={items} csrf={session.csrf} />
    </AdminChrome>
  )
}
