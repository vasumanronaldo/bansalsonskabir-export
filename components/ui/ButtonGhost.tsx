// The only button style (docs/02 § Component inventory): transparent, 1px gold
// border, mono label, inverts to gold-fill / obsidian-text on hover. There is no
// filled "primary" button. Renders as a link when `href` is set, else a button.
import Link from 'next/link'
import type { ReactNode } from 'react'

const base =
  'group inline-flex items-center justify-center gap-2 border px-6 py-3 ' +
  'font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] font-medium uppercase tracking-[0.12em] ' +
  'transition-colors duration-[250ms] ease-[var(--ease-editorial)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

// On pearl fields: gold hairline, inverts to gold fill + obsidian text.
const light = 'border-gold text-charcoal hover:bg-gold hover:text-obsidian'
// On dark fields: soft-gold hairline + text, inverts to soft-gold fill + obsidian.
const dark = 'border-gold-soft text-gold-soft hover:bg-gold-soft hover:text-obsidian'

type Common = { onDark?: boolean; className?: string; children: ReactNode }

export function ButtonGhost({
  href,
  onDark = false,
  className = '',
  children,
  ...rest
}: Common & { href?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${onDark ? dark : light} ${className}`
  if (href) {
    const external = href.startsWith('http')
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
