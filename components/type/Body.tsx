// Body copy — Archivo. Measure capped at 62ch; never full-bleed paragraphs.
import type { ElementType, ReactNode } from 'react'

type Size = 'lg' | 'base' | 'sm'

const SIZE: Record<Size, string> = {
  lg: 'text-[length:var(--text-body-lg)] leading-[1.65]',
  base: 'text-[length:var(--text-body)] leading-[1.65]',
  sm: 'text-[length:var(--text-body-sm)] leading-[1.6]',
}

export function Body({
  size = 'base',
  as: Tag = 'p',
  measure = true,
  muted = false,
  className = '',
  children,
}: {
  size?: Size
  as?: ElementType
  /** cap width at 62ch (docs/02 § Measure) */
  measure?: boolean
  muted?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={`font-[family-name:var(--font-body)] ${SIZE[size]} ${measure ? 'max-w-[62ch]' : ''} ${muted ? 'text-stone' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}
