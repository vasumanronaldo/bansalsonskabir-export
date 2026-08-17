// /maison — The Maison (docs/04 § Maison). The showroom described honestly;
// converts NRIs and first-time visitors. People-at-the-bench is consent-gated.
import type { Metadata } from 'next'
import { getSettings, getVisit } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Body, Label } from '@/components/type'
import { Placeholder } from '@/components/ui/Placeholder'
import { PeopleBench } from '@/components/blocks/PeopleBench'
import { CtaBand } from '@/components/blocks/CtaBand'

export const metadata: Metadata = {
  title: 'The Maison',
  description: 'The showroom in Malviya Nagar, South Delhi — grey marble, one private cabin, and an honest visit.',
}

export default function MaisonPage() {
  const { data: s, _meta } = getSettings()
  const visit = getVisit()
  // The visit is now client copy (content/client/12-visit.md): four sentences,
  // rendered as the short sequence. The leading "# What a visit is like" heading
  // is dropped — the section already carries that label.
  const visitLines = visit.body
    .split(/\n{2,}/)
    .map((p) => p.trim().replace(/\n/g, ' '))
    .filter((p) => p && !p.startsWith('#'))

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">The maison</Label>
        <Display size="xl" as="h1" className="mt-6">
          {s.address.line1}.
        </Display>
      </Section>

      {/* The room */}
      <Section field="pearl-deep">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 md:items-center">
          <div>
            <Display size="md" as="h2">
              The room
            </Display>
            <Body className="mt-6">
              Grey Italian marble underfoot, black marble on the feature walls, and light from above. Nine
              seating areas, so a conversation is never overheard, and one private cabin for the occasions
              that call for it. Nothing is behind glass you cannot ask to hold.
            </Body>
          </div>
          <Placeholder ratio="3:2" ground="obsidian" label="The showroom — marble and light" />
        </div>
      </Section>

      {/* What a visit is like */}
      <Section field="pearl">
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-[16rem_1fr]">
          <Label className="pt-1">What a visit is like</Label>
          <ul className="space-y-4">
            {visitLines.map((line) => (
              <li key={line.slice(0, 24)}>
                <Lede>{line}</Lede>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* People at the bench */}
      <Section field="pearl-deep">
        <PeopleBench />
      </Section>

      {/* Practical */}
      <Section field="pearl">
        <Label className="block">
          Practical
          <DraftFlag meta={_meta} />
        </Label>
        <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-3">
          <div>
            <Label size="lg" className="block text-charcoal">Hours</Label>
            <ul className="mt-3 space-y-1">
              {s.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-4 text-[length:var(--text-body-sm)] text-stone">
                  <span>{h.days}</span>
                  <span>{h.open && h.close ? `${h.open}–${h.close}` : (h.label ?? 'Closed')}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label size="lg" className="block text-charcoal">Getting here</Label>
            <Body size="sm" muted className="mt-3">
              Nearest metro: {s.metro.station} ({s.metro.line}), {s.metro.walkMinutes} minutes on foot.
              The landmark is {s.landmark}.
            </Body>
          </div>
          <div>
            <Label size="lg" className="block text-charcoal">Parking</Label>
            <Body size="sm" muted className="mt-3">
              {s.parking}
            </Body>
          </div>
        </div>
      </Section>

      <CtaBand
        heading="Come and see the room."
        body="An appointment means the person who will make your piece is at the table. Walk-ins are always welcome."
      />
    </>
  )
}
