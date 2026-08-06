'use client'

// Newsletter signup (docs/03 § Route handlers) — double opt-in. Sends the email
// to /api/newsletter, which emails a confirmation link. Honeypot + timing guard.
import { useEffect, useRef, useState } from 'react'
import { Section } from '@/components/layout/Section'
import { Display, Body, Label } from '@/components/type'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const renderedAt = useRef(0)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, company, renderedAt: renderedAt.current }),
      })
      const j = await res.json()
      setState(res.ok && j.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <Section field="obsidian">
      <div className="max-w-[46ch]">
        <Label gold className="block">The letter</Label>
        <Display size="md" as="h2" className="mt-4 text-pearl">
          The occasional letter.
        </Display>
        <Body className="mt-4 text-stone-light">
          A few times a year — a new commission, a note on how to buy, a piece of the house&rsquo;s history.
          Never more often, never shared.
        </Body>

        {state === 'done' ? (
          <Body className="mt-8 text-pearl" aria-live="polite">
            Please check your email and click the link to confirm. Nothing is added until you do.
          </Body>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-wrap items-end gap-4">
            <div className="min-w-[16rem] flex-1">
              <label htmlFor="nl-email" className="sr-only">Email</label>
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full border-b border-[var(--color-hairline-inv)] bg-transparent py-2.5 text-[16px] text-pearl outline-none placeholder:text-stone focus:border-gold-soft"
              />
            </div>
            {/* honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={state === 'sending'}
              className="border border-gold-soft px-6 py-3 font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] font-medium uppercase tracking-[0.12em] text-gold-soft transition-colors duration-[250ms] hover:bg-gold-soft hover:text-obsidian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60"
            >
              {state === 'sending' ? 'Sending…' : 'Subscribe'}
            </button>
            {state === 'error' && <p className="w-full text-[length:var(--text-body-sm)] text-[#e5484d]">Please enter a valid email and try again.</p>}
          </form>
        )}
      </div>
    </Section>
  )
}
