// Timeline (docs/04 § Legacy). From 02-timeline.json (moves to Sanity later).
// Year in mono, title in Bodoni, one line of prose. Hairline-separated rows.
import { getTimeline } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Hairline } from '@/components/layout/Hairline'
import { Display, Body, Label } from '@/components/type'

interface Event {
  year: number
  title: string
  description?: string
}

export function Timeline() {
  const { data, _meta } = getTimeline()
  const events = ((data.events as Event[]) ?? []).slice().sort((a, b) => a.year - b.year)
  if (!events.length) return null

  return (
    <div>
      <Label className="mb-8 block">
        The years
        <DraftFlag meta={_meta} />
      </Label>
      <ol>
        {events.map((e, i) => (
          <li key={`${e.year}-${i}`}>
            {i > 0 && <Hairline />}
            <div className="grid gap-x-10 gap-y-2 py-8 md:grid-cols-[7rem_1fr]">
              <span className="pt-1 font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] tracking-[0.12em] text-gold">
                {e.year}
              </span>
              <div>
                <Display size="sm" as="h3">
                  {e.title}
                </Display>
                {e.description && (
                  <Body muted className="mt-2">
                    {e.description}
                  </Body>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
