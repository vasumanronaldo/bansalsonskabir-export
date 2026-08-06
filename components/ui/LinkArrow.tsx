// Editorial text link with a trailing arrow. 250ms colour/underline transition
// only on hover (docs/02 § Motion — permitted). The arrow eases right on hover.
import Link from 'next/link'
import type { ReactNode } from 'react'

export function LinkArrow({
  href,
  onDark = false,
  className = '',
  children,
}: {
  href: string
  onDark?: boolean
  className?: string
  children: ReactNode
}) {
  const external = href.startsWith('http')
  const tone = onDark ? 'text-pearl hover:text-gold-soft' : 'text-charcoal hover:text-gold'
  const cls =
    `group inline-flex items-center gap-2 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] ` +
    `underline-offset-4 transition-colors duration-[250ms] ease-[var(--ease-editorial)] hover:underline ` +
    `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${tone} ${className}`

  const inner = (
    <>
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-[250ms] ease-[var(--ease-editorial)] group-hover:translate-x-1"
      >
        →
      </span>
    </>
  )

  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}
