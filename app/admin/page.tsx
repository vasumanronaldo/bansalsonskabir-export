// /admin — throwaway dashboard for Session 1: proves the session round-trips.
// Forces the one-time-password change before anything else. The real screens
// (pieces, collections, enquiries, settings, users) arrive in 10c–10f.
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function AdminHome() {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')

  return (
    <main className="min-h-screen bg-obsidian px-6 py-16 text-pearl">
      <div className="mx-auto max-w-2xl">
        <p className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.3em] text-stone-light">Signed in</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{session.user.name}</h1>
        <p className="mt-1 text-stone-light">
          {session.user.email} · {session.user.role}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin/pieces" className="border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian">
            Manage pieces
          </Link>
        </div>
        <p className="mt-6 max-w-[50ch] text-sm text-stone-light">
          Pieces + photo uploads are live. Collections, settings, enquiries and users come next (10e); the public
          site starts reading from here in 10f.
        </p>
        <form method="POST" action="/admin/api/logout" className="mt-8">
          <input type="hidden" name="csrf" value={session.csrf} />
          <button className="border border-hairline-inv px-4 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-pearl transition-colors hover:border-gold-soft hover:text-gold-soft">
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
