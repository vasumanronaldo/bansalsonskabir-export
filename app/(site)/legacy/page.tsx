// /legacy — Our Legacy (docs/04 § Legacy). Founder story from 01-founder.md,
// timeline from 02-timeline.json, the manifesto verbatim on obsidian.
import type { Metadata } from 'next'
import { getFounder } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Display, Lede, Label } from '@/components/type'
import { Prose } from '@/components/Prose'
import { Placeholder } from '@/components/ui/Placeholder'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { Timeline } from '@/components/blocks/Timeline'

export const metadata: Metadata = {
  title: 'Our Legacy',
  description: 'A house built one family at a time, in South Delhi since 1993.',
}

export default function LegacyPage() {
  const { body: founder, _meta } = getFounder()

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Our legacy</Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[18ch]">
          A house built one family at a time.
        </Display>
      </Section>

      {/* The founder */}
      <Section field="pearl-deep">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-[minmax(0,26rem)_1fr]">
          <div>
            <Placeholder ratio="4:5" ground="charcoal" label="Shri Ashok Kumar Bansal — portrait, 1993" />
            <Label className="mt-4 block">
              The founder
              <DraftFlag meta={_meta} />
            </Label>
          </div>
          <div>
            <Prose markdown={founder} />
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section field="pearl">
        <Timeline />
      </Section>

      {/* The manifesto — verbatim (docs/04 § Legacy #4) */}
      <Section field="obsidian">
        <div className="mx-auto max-w-[54ch]">
          <div className="mb-10 h-px w-24 bg-gold" />
          <Display size="md" as="p" className="text-pearl">
            Before there is jewellery, there is trust.
          </Display>
          <div className="mt-8 space-y-6 text-stone-light">
            <Lede className="text-stone-light">
              For over three decades we have believed that the most valuable thing we create is confidence.
              Confidence that every recommendation is honest, every diamond is authentic, every promise is
              honoured, and every creation is worthy of becoming part of a family&rsquo;s legacy.
            </Lede>
            <Lede className="text-stone-light">
              Trends change and prices fluctuate, but integrity remains timeless. We do not aspire to become
              the biggest jewellery house. We aspire to become the one people trust the most.
            </Lede>
            <Lede className="text-stone-light">
              Jewellery is inherited, remembered and lived. Trust is what makes it worth inheriting.
            </Lede>
          </div>
        </div>
      </Section>

      <Section field="pearl">
        <Container className="!px-0">
          <LinkArrow href="/craftsmanship">See how a piece is made</LinkArrow>
        </Container>
      </Section>
    </>
  )
}
