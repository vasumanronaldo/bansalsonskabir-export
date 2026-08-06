// Amber DRAFT marker for unconfirmed client content. Renders in DEVELOPMENT
// ONLY — the production guard is a hard early-return, so a DRAFT badge can never
// reach a live build even if a caller forgets to check. (CLAUDE.md: "Never let a
// DRAFT marker or a [TK] value render in a production build.")

import type { ContentMeta } from '@/lib/client-content'

export function DraftFlag({ meta, label = 'DRAFT' }: { meta: ContentMeta; label?: string }) {
  if (process.env.NODE_ENV === 'production') return null
  if (meta.approved && meta.tk === 0) return null

  const bits = [
    !meta.approved ? 'unapproved' : null,
    meta.tk > 0 ? `${meta.tk} × [TK]` : null,
    meta.needs.length ? `needs: ${meta.needs.join(', ')}` : null,
  ].filter(Boolean)

  return (
    <span
      role="note"
      aria-hidden="true"
      title={`${meta.file} — ${bits.join(' · ')}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        marginInlineStart: '0.5ch',
        padding: '0.1em 0.5em',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.625rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#7a5a00',
        background: '#fbe6c2',
        border: '1px solid #e3b23c',
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  )
}
