// Display type — Bodoni Moda, the Didone voice (docs/02 § Type scale).
// Weight 400; 500 only at the largest size.
import type { ElementType, ReactNode } from 'react'

type Size = 'xl' | 'lg' | 'md' | 'sm'

const SIZE: Record<Size, string> = {
  xl: 'text-[length:var(--text-display-xl)] leading-[1.02] tracking-[-0.02em] font-medium',
  lg: 'text-[length:var(--text-display-lg)] leading-[1.08] tracking-[-0.015em] font-normal',
  md: 'text-[length:var(--text-display-md)] leading-[1.15] font-normal',
  sm: 'text-[length:var(--text-display-sm)] leading-[1.25] font-normal',
}

export function Display({
  size = 'lg',
  as: Tag = 'h2',
  className = '',
  children,
}: {
  size?: Size
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={`font-[family-name:var(--font-display)] text-balance ${SIZE[size]} ${className}`}>
      {children}
    </Tag>
  )
}
