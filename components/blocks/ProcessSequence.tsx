// Process sequence (docs/04 § Craftsmanship #2, § Bespoke #3). From
// 03-process.json. Numbered 01–08 markers are correct ONLY on craftsmanship —
// it is a real ordered process; pass numbered={false} elsewhere.
import { getProcess } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Hairline } from '@/components/layout/Hairline'
import { Placeholder } from '@/components/ui/Placeholder'
import { Display, Body, Label } from '@/components/type'

interface Step {
  order: number
  title: string
  duration?: string
  description?: string
}

export function ProcessSequence({ numbered = true, withImages = true }: { numbered?: boolean; withImages?: boolean }) {
  const { data, _meta } = getProcess()
  const steps = ((data.steps as Step[]) ?? []).slice().sort((a, b) => a.order - b.order)
  if (!steps.length) return null

  return (
    <div>
      <DraftFlag meta={_meta} />
      <ol className="space-y-0">
        {steps.map((s, i) => (
          <li key={s.order}>
            {i > 0 && <Hairline />}
            <div className="grid gap-x-10 gap-y-4 py-10 md:grid-cols-[1fr_1fr] md:items-start">
              <div>
                {numbered && (
                  <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] tracking-[0.16em] text-gold">
                    {String(s.order).padStart(2, '0')}
                  </span>
                )}
                <Display size="sm" as="h3" className="mt-3">
                  {s.title}
                </Display>
                {s.duration && (
                  <Label className="mt-2 block">{s.duration}</Label>
                )}
                {s.description && (
                  <Body muted className="mt-4">
                    {s.description}
                  </Body>
                )}
              </div>
              {withImages && (
                <Placeholder ratio="3:2" ground="charcoal" label={`${s.title} — the bench`} />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
