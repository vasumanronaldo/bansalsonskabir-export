// Shared chrome for the authenticated admin screens: top bar with nav + sign out.
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AdminChrome({ name, csrf, children }: { name: string; csrf: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian text-pearl">
      <header className="flex items-center justify-between border-b border-hairline-inv px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-[family-name:var(--font-display)] text-lg">
            Bansal Sons <span className="text-stone-light">Admin</span>
          </Link>
          <nav className="flex gap-5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.2em] text-stone-light">
            <Link href="/admin/pieces" className="hover:text-gold-soft">Pieces</Link>
            <Link href="/admin/journal" className="hover:text-gold-soft">Journal</Link>
            <Link href="/admin/media" className="hover:text-gold-soft">Media</Link>
            <Link href="/admin/pages" className="hover:text-gold-soft">Pages</Link>
            <Link href="/admin/content" className="hover:text-gold-soft">House</Link>
            <Link href="/admin/appointments" className="hover:text-gold-soft">Appointments</Link>
            <Link href="/admin/settings" className="hover:text-gold-soft">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-stone-light">
          <span>{name}</span>
          <form method="POST" action="/admin/api/logout">
            <input type="hidden" name="csrf" value={csrf} />
            <button className="hover:text-gold-soft">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
