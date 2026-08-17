// /admin/login — email + password, nothing else (docs/10 § 6). Server-rendered
// native form (no client JS) so it works under the strict admin CSP. Already
// signed in → straight to the dashboard.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentSession } from '@/lib/admin/session'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentSession()) redirect('/admin')
  const { error } = await searchParams
  const msg = error === 'rate' ? 'Too many attempts. Try again in fifteen minutes.' : error ? 'Incorrect email or password.' : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-pearl">
      <form method="POST" action="/admin/api/login" className="w-full max-w-sm">
        <p className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.3em] text-stone-light">Bansal Sons</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Admin</h1>
        {msg && (
          <p role="alert" className="mt-5 border border-[#7a2e2e] bg-[#2a1414] px-3 py-2 text-sm text-[#e6b0b0]">
            {msg}
          </p>
        )}
        <label className="mt-6 block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.22em] text-stone-light">
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            className="mt-2 block w-full border border-hairline-inv bg-charcoal px-3 py-2 text-pearl outline-none focus:border-gold-soft"
          />
        </label>
        <label className="mt-4 block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.22em] text-stone-light">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 block w-full border border-hairline-inv bg-charcoal px-3 py-2 text-pearl outline-none focus:border-gold-soft"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
