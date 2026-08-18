'use client'

// Header — centred crest lockup with split navigation (as in the render). Solid
// cream with a hairline so it reads on any hero.
import { useState } from 'react'
import Link from 'next/link'
import { Wordmark } from '@/components/Wordmark'
import { ButtonGhost } from '@/components/ui/ButtonGhost'

const LEFT = [
  { href: '/', label: 'Home' },
  { href: '/legacy', label: 'Legacy' },
  { href: '/craftsmanship', label: 'Craftsmanship' },
  { href: '/collections', label: 'Collections' },
] as const
const RIGHT = [
  { href: '/maison', label: 'Maison' },
  { href: '/bespoke', label: 'Bespoke' },
  { href: '/journal', label: 'Journal' },
] as const
const ALL = [...LEFT, ...RIGHT, { href: '/contact', label: 'Contact' }] as const

const navLink =
  'font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.16em] text-charcoal transition-colors duration-200 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-hairline)] bg-pearl/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--spacing-gutter)] py-4">
        {/* left nav */}
        <nav aria-label="Primary" className="hidden items-center gap-7 justify-self-start lg:flex">
          {LEFT.map((i) => (
            <Link key={i.href} href={i.href} className={navLink}>{i.label}</Link>
          ))}
        </nav>

        {/* centred crest */}
        <Link href="/" className="justify-self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:col-start-2">
          <Wordmark />
        </Link>

        {/* right nav + CTA */}
        <nav aria-label="Primary" className="hidden items-center gap-7 justify-self-end lg:flex">
          {RIGHT.map((i) => (
            <Link key={i.href} href={i.href} className={navLink}>{i.label}</Link>
          ))}
          <Link href="/appointment" className={navLink}>Appointment</Link>
        </nav>

        {/* mobile toggle (left cell) */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="col-start-1 row-start-1 flex h-11 w-11 items-center justify-center justify-self-start border border-[var(--color-hairline)] font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-charcoal lg:hidden"
        >
          {open ? '×' : '≡'}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-[var(--color-hairline)] bg-pearl px-[var(--spacing-gutter)] py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {ALL.map((i) => (
              <li key={i.href}>
                <Link href={i.href} onClick={() => setOpen(false)} className="block py-3 font-[family-name:var(--font-body)] text-charcoal hover:text-gold">
                  {i.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <ButtonGhost href="/appointment" className="w-full">Request an appointment</ButtonGhost>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
