// Shared light-theme building blocks for the admin, so every screen uses the same
// card, label and heading language. Warm cream surfaces, hairline borders, a whisper
// of shadow, gold for anything that acts.
import type { ReactNode } from 'react'

export const CARD = 'rounded-2xl border border-hairline bg-white shadow-[0_1px_3px_rgba(42,35,26,0.05)]'
export const LABEL = 'font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.24em] text-stone'
export const ACTION =
  'inline-flex items-center gap-2 rounded-lg border border-gold px-4 py-2.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-white'

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <p className={LABEL}>{title}</p>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD} p-6 ${className}`}>{children}</div>
}

// A gold-ringed circular icon badge, as on the stat cards.
export function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold ring-1 ring-gold/20">
      {children}
    </span>
  )
}

export function StatCard({ label, value, icon, note }: { label: string; value: string | number; icon: ReactNode; note?: ReactNode }) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.18em] text-stone">{label}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-[1.9rem] leading-none text-charcoal">{value}</p>
        </div>
        <IconBadge>{icon}</IconBadge>
      </div>
      {note && <p className="mt-3 text-[0.72rem] text-stone">{note}</p>}
    </div>
  )
}
