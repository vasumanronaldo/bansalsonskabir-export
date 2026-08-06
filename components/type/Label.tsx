// Utility label — IBM Plex Mono, uppercase, letter-spaced (docs/02 § Type scale).
// Small-caps-style labels, section eyebrows, reference numbers, spec rows.
import type { ElementType, ReactNode } from 'react'

type Size = 'base' | 'lg'

const SIZE: Record<Size, string> = {
  base: 'text-[length:var(--text-label)] tracking-[0.16em]',
  lg: 'text-[length:var(--text-label-lg)] tracking-[0.12em]',
}

export function Label({
  size = 'base',
  as: Tag = 'span',
  gold = false,
  className = '',
  children,
}: {
  size?: Size
  as?: ElementType
  /** hairline gold accent — counts toward the ≤3 gold-per-viewport cap */
  gold?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={`inline-block font-[family-name:var(--font-mono)] font-medium uppercase ${SIZE[size]} ${gold ? 'text-gold' : 'text-stone'} ${className}`}
    >
      {children}
    </Tag>
  )
}
