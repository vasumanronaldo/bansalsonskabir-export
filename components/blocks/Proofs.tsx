// The five proofs (docs/04 § Home #2). Pearl, hairline-separated rows, NO icons.
// Each row: mono label · display-sm heading · one sentence. Copy verbatim.
import { Section } from '@/components/layout/Section'
import { Hairline } from '@/components/layout/Hairline'
import { Display, Body, Label } from '@/components/type'

const PROOFS = [
  { label: 'Manufacturer', heading: 'Made in our own workshops', body: 'Nothing is bought in and rebranded. Design, casting, setting, polishing and finishing all happen in our own workshops.' },
  { label: 'Certification', heading: 'Natural diamonds only', body: 'GIA and IGI certified. Every gold piece BIS hallmarked and HUID registered. Lab-grown stones are not sold here.' },
  { label: 'Continuity', heading: 'One family, one address', body: 'Founded in 1993 by Shri Ashok Kumar Bansal. Run today by his sons.' },
  { label: 'Transparency', heading: 'Billed in front of you', body: 'Weighing, billing and packing are done at your table. You are told how the price is built before you decide.' },
  { label: 'Aftercare', heading: 'Serviced for life', body: 'Cleaning, polishing, resizing and repair, at no charge, for anything we have made.' },
] as const

export function Proofs() {
  return (
    <Section field="pearl">
      <ul>
        {PROOFS.map((p, i) => (
          <li key={p.label}>
            {i > 0 && <Hairline className="my-0" />}
            <div className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[10rem_18rem_1fr] md:py-10">
              <Label className="pt-1">{p.label}</Label>
              <Display size="sm" as="h3">
                {p.heading}
              </Display>
              <Body muted className="md:pt-1">
                {p.body}
              </Body>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
