// A page section with the vertical rhythm and field tone (docs/02 § Layout,
// § Section rhythm). Fields mimic the showroom's marble: pearl by default,
// obsidian/charcoal for feature sections. Separated by hairline, never a shadow.
import type { ReactNode } from 'react'
import { Container } from './Container'

type Field = 'pearl' | 'pearl-deep' | 'charcoal' | 'obsidian'

const FIELD: Record<Field, string> = {
  pearl: 'bg-pearl text-charcoal',
  'pearl-deep': 'bg-pearl-deep text-charcoal',
  charcoal: 'bg-charcoal text-pearl',
  obsidian: 'bg-obsidian text-pearl',
}

export function Section({
  field = 'pearl',
  bleedFull = false,
  className = '',
  containerClassName = '',
  children,
  id,
  'aria-label': ariaLabel,
}: {
  field?: Field
  /** full-bleed content (e.g. the Bansal Standard) — skips the Container */
  bleedFull?: boolean
  className?: string
  containerClassName?: string
  children: ReactNode
  id?: string
  'aria-label'?: string
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`${FIELD[field]} py-[var(--spacing-rhythm)] ${className}`}
    >
      {bleedFull ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  )
}
