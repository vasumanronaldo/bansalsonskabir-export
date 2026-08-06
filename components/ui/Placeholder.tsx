// Photography placeholder (CLAUDE.md prohibitions + docs/02 § Imagery).
// Use this everywhere a real photograph will go, until one is supplied. NEVER
// stock or AI-generated imagery of people or jewellery. Grounds are charcoal /
// stone / obsidian — never a white sweep. It names the shot it's standing in for
// so reviews can see exactly what photography is still owed.
import type { CSSProperties } from 'react'

type Ratio = '4:5' | '3:2' | '1:1'
type Ground = 'charcoal' | 'stone' | 'obsidian'

const RATIO: Record<Ratio, string> = {
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
  '1:1': 'aspect-square',
}
const GROUND: Record<Ground, string> = {
  charcoal: 'bg-charcoal text-stone-light',
  stone: 'bg-stone text-pearl',
  obsidian: 'bg-obsidian text-stone-light',
}

export function Placeholder({
  ratio = '4:5',
  ground = 'charcoal',
  label,
  className = '',
}: {
  ratio?: Ratio
  ground?: Ground
  /** what photograph belongs here, e.g. "Workshop — the bench, 3:2" */
  label: string
  className?: string
}) {
  // Hairline inset frame, drawn with a border on an inner element (no radius).
  const frame: CSSProperties = { boxShadow: 'inset 0 0 0 1px var(--color-hairline-inv)' }
  return (
    <div
      role="img"
      aria-label={`Photograph pending: ${label}`}
      className={`relative flex items-center justify-center overflow-hidden ${RATIO[ratio]} ${GROUND[ground]} ${className}`}
    >
      <div className="pointer-events-none absolute inset-3" style={frame} />
      <div className="px-6 text-center">
        <span className="block font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.16em]">
          Photograph pending
        </span>
        <span className="mt-2 block font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] opacity-80">
          {label}
        </span>
        <span className="mt-1 block font-[family-name:var(--font-mono)] text-[length:var(--text-label)] tracking-[0.12em] opacity-60">
          {ratio}
        </span>
      </div>
    </div>
  )
}
