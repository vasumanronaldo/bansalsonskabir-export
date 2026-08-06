// The maker's-dossier record (docs/04 § dossier). Mono spec rows with leader
// dots. Multi-line values (stones, service) align under the value column. Only
// rows with a real value are passed in — never an empty row or "N/A".
import { Fragment, type ReactNode } from 'react'

export interface DossierRow {
  label: string
  /** one or more value lines; must be non-empty */
  lines: ReactNode[]
}

function Row({ row }: { row: DossierRow }) {
  return (
    <div className="py-2">
      {row.lines.map((line, i) => (
        <div key={i} className="flex items-baseline gap-3">
          <span className="shrink-0 font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.14em] text-stone">
            {i === 0 ? row.label : ''}
          </span>
          <span aria-hidden className="min-w-6 flex-1 translate-y-[-0.28em] border-b border-dotted border-[var(--color-hairline)]" />
          <span className="text-right font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-charcoal">
            {line}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DossierRecord({ groups }: { groups: DossierRow[][] }) {
  return (
    <div className="divide-y divide-[var(--color-hairline)]">
      {groups.map((rows, gi) => (
        <div key={gi} className="py-4 first:pt-0">
          {rows.map((row, ri) => (
            <Fragment key={ri}>
              <Row row={row} />
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  )
}
