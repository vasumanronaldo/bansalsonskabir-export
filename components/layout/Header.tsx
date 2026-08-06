'use client'

// Sticky header (docs/02): hairline, transparent → pearl on scroll. The wordmark
// is the LEGAL name only (never "the House of Bansal"). Nav labels are route
// names; the legal name is passed in from the content loader, never hardcoded.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ButtonGhost } from '@/components/ui/ButtonGhost'

const NAV = [
  { href: '/legacy', label: 'Legacy' },
  { href: '/maison', label: 'Maison' },
  { href: '/craftsmanship', label: 'Craftsmanship' },
  { href: '/bespoke', label: 'Bespoke' },
  { href: '/collections', label: 'Collections' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
] as const

export function Header({ wordmark }: { wordmark: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-[250ms] ease-[var(--ease-editorial)] ${
        scrolled ? 'border-b border-[var(--color-hairline)] bg-pearl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-[var(--spacing-gutter)] py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-display-sm)] tracking-tight text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {wordmark}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-charcoal underline-offset-4 transition-colors duration-[250ms] ease-[var(--ease-editorial)] hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {item.label}
            </Link>
          ))}
          <ButtonGhost href="/appointment">Request an appointment</ButtonGhost>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center border border-[var(--color-hairline)] font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-charcoal lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-[var(--color-hairline)] bg-pearl px-[var(--spacing-gutter)] py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-[family-name:var(--font-body)] text-charcoal hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <ButtonGhost href="/appointment" className="w-full">
                Request an appointment
              </ButtonGhost>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
