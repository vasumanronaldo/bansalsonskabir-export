// /admin/password — forced when must_change = 1, and reachable any time to
// change your own password. Native form; CSRF token from the session.
import type { Metadata } from 'next'
import { requireSession } from '@/lib/admin/session'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Change password', robots: { index: false, follow: false } }

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await requireSession()
  const { error } = await searchParams
  const msg =
    error === 'len' ? 'Use at least eight characters.'
    : error === 'match' ? 'The new passwords do not match.'
    : error === 'current' ? 'Your current password is incorrect.'
    : null

  const field = 'mt-2 block w-full border border-hairline-inv bg-charcoal px-3 py-2 text-pearl outline-none focus:border-gold-soft'
  const label = 'mt-4 block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.22em] text-stone-light'

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-pearl">
      <form method="POST" action="/admin/api/password" className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Set a new password</h1>
        <p className="mt-3 text-sm text-stone-light">Your account is on a one-time password. Choose a new one to continue.</p>
        {msg && (
          <p role="alert" className="mt-5 border border-[#7a2e2e] bg-[#2a1414] px-3 py-2 text-sm text-[#e6b0b0]">
            {msg}
          </p>
        )}
        <input type="hidden" name="csrf" value={session.csrf} />
        <label className={label}>
          Current password
          <input name="current" type="password" autoComplete="current-password" required className={field} />
        </label>
        <label className={label}>
          New password
          <input name="next" type="password" autoComplete="new-password" required minLength={8} className={field} />
        </label>
        <label className={label}>
          Confirm new password
          <input name="confirm" type="password" autoComplete="new-password" required className={field} />
        </label>
        <button
          type="submit"
          className="mt-6 w-full border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          Update password
        </button>
      </form>
    </main>
  )
}
