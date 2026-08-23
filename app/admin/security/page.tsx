// /admin/security — two-factor authentication for your own account (opt-in).
// Three states: off (turn on), pending (scan/enter secret then confirm a code),
// and on (disable). Confirm-before-enable means a half-setup can't lock you out.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession, mustChangePassword } from '@/lib/admin/session'
import { getTwoFAStatus } from '@/lib/admin/twofa-db'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Security', robots: { index: false, follow: false } }

const btn = 'border border-gold-soft px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian'
const H = 'font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-stone-light'

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; off?: string }> }) {
  const session = await requireSession()
  if (await mustChangePassword(session.user.id)) redirect('/admin/password')
  const sp = await searchParams
  const status = await getTwoFAStatus(session.user.id, session.user.email)

  return (
    <AdminChrome name={session.user.name} csrf={session.csrf}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Security</h1>
      <p className="mt-2 max-w-2xl text-stone-light">Two-factor authentication asks for a 6-digit code from an app on your phone each time you sign in — so a stolen password isn&rsquo;t enough on its own.</p>

      {sp.ok && <p className="mt-6 border border-[#2f4a2f] bg-[#16220f] px-4 py-3 text-sm text-[#8fbf8f]">Two-factor authentication is now on.</p>}
      {sp.off && <p className="mt-6 border border-hairline-inv bg-charcoal/30 px-4 py-3 text-sm text-stone-light">Two-factor authentication has been turned off.</p>}
      {sp.error === 'code' && <p className="mt-6 border border-[#7a2e2e] bg-[#2a1414] px-4 py-3 text-sm text-[#e6b0b0]">That code didn&rsquo;t match. Make sure you entered the current one, then try again.</p>}

      <section className="mt-8 max-w-2xl border border-hairline-inv bg-charcoal/30 p-6">
        <p className={H}>Status</p>

        {status.enabled ? (
          <>
            <p className="mt-3 text-lg text-pearl">On <span className="ml-2 align-middle text-[0.65rem] uppercase tracking-[0.16em] text-[#8fbf8f]">● active</span></p>
            <p className="mt-2 text-sm text-stone-light">You&rsquo;ll be asked for a code from your authenticator app each time you sign in.</p>
            <form method="POST" action="/admin/api/security" className="mt-5">
              <input type="hidden" name="csrf" value={session.csrf} />
              <input type="hidden" name="op" value="disable" />
              <button className="border border-[#7a2e2e] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-[#e6b0b0] transition-colors hover:bg-[#7a2e2e] hover:text-pearl">Turn off</button>
            </form>
          </>
        ) : status.pending ? (
          <>
            <p className="mt-3 text-lg text-pearl">Almost there</p>
            <p className="mt-2 text-sm text-stone-light">Add this account to your authenticator app — scan is best, or type the key by hand — then enter the 6-digit code it shows to finish.</p>

            <p className="mt-5 text-[0.6rem] uppercase tracking-[0.2em] text-stone">Setup key</p>
            <code className="mt-1 block break-all border border-hairline-inv bg-obsidian px-3 py-2 font-[family-name:var(--font-mono)] text-sm tracking-[0.15em] text-gold-soft">{status.secret}</code>
            <p className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-stone">Or this setup link</p>
            <code className="mt-1 block break-all border border-hairline-inv bg-obsidian px-3 py-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-stone-light">{status.uri}</code>

            <form method="POST" action="/admin/api/security" className="mt-5 flex flex-wrap items-end gap-3">
              <input type="hidden" name="csrf" value={session.csrf} />
              <input type="hidden" name="op" value="confirm" />
              <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-stone-light">
                6-digit code
                <input name="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} required autoFocus className="mt-1 block w-40 border border-hairline-inv bg-obsidian px-3 py-2 text-center text-lg tracking-[0.3em] text-pearl outline-none focus:border-gold-soft" />
              </label>
              <button className={btn}>Confirm &amp; turn on</button>
            </form>
            <form method="POST" action="/admin/api/security" className="mt-3">
              <input type="hidden" name="csrf" value={session.csrf} />
              <input type="hidden" name="op" value="disable" />
              <button className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-stone hover:text-stone-light">Cancel</button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg text-pearl">Off</p>
            <p className="mt-2 text-sm text-stone-light">Recommended. You&rsquo;ll need an authenticator app such as Google Authenticator, 1Password or Authy.</p>
            <form method="POST" action="/admin/api/security" className="mt-5">
              <input type="hidden" name="csrf" value={session.csrf} />
              <input type="hidden" name="op" value="begin" />
              <button className={btn}>Turn on two-factor</button>
            </form>
          </>
        )}
      </section>
    </AdminChrome>
  )
}
