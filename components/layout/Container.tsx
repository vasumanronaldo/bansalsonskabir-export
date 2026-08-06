// Max-width 1240px with fluid gutter (docs/02 § Layout).
import type { ElementType, ReactNode } from 'react'

export function Container({
  as: Tag = 'div',
  className = '',
  children,
}: {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[1240px] px-[var(--spacing-gutter)] ${className}`}
    >
      {children}
    </Tag>
  )
}
