// Reusable closing CTA (used across the story pages). ButtonGhost only, no
// urgency. Charcoal by default.
import { Section } from '@/components/layout/Section'
import { Display, Body } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'

export function CtaBand({
  heading,
  body,
  href = '/appointment',
  label = 'Request a private appointment',
}: {
  heading: string
  body?: string
  href?: string
  label?: string
}) {
  return (
    <Section field="charcoal">
      <div className="max-w-[52ch]">
        <Display size="lg" as="h2" className="text-pearl">
          {heading}
        </Display>
        {body && <Body className="mt-6 text-stone-light">{body}</Body>}
        <div className="mt-10">
          <ButtonGhost onDark href={href}>
            {label}
          </ButtonGhost>
        </div>
      </div>
    </Section>
  )
}
