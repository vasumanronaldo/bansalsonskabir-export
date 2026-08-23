// /admin/login/2fa — second login step for accounts with 2FA. Reached only with
// a valid short-lived handoff cookie from the password step. Native form, no JS.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Verification', robots: { index: false, follow: false } }

export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const jar = await cookies()
  if (!jar.get('bsj_2fa')) redirect('/admin/login')
  const { error } = await searchParams
  const msg = error === 'expired' ? 'That took too long — sign in again.' : error ? 'Incorrect code. Try the current one.' : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-pearl">
      <form method="POST" action="/admin/api/login/2fa" className="w-full max-w-sm">
        <p className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.3em] text-stone-light">Bansal Sons</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Verify it&rsquo;s you</h1>
        <p className="mt-3 text-sm text-stone-light">Enter the 6-digit code from your authenticator app.</p>
        {msg && (
          <p role="alert" className="mt-5 border border-[#7a2e2e] bg-[#2a1414] px-3 py-2 text-sm text-[#e6b0b0]">
            {msg}
          </p>
        )}
        <label className="mt-6 block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.22em] text-stone-light">
          Code
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            className="mt-2 block w-full border border-hairline-inv bg-charcoal px-3 py-2 text-center text-lg tracking-[0.4em] text-pearl outline-none focus:border-gold-soft"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full border border-gold-soft px-4 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian"
        >
          Verify
        </button>
      </form>
    </main>
  )
}
