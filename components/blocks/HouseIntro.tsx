// The house (docs/04 § Home #5). Pearl, two-column. "Thirty-three years" — 1993
// to 2026 is 33, never 35.
import { Section } from '@/components/layout/Section'
import { Display, Body } from '@/components/type'
import { LinkArrow } from '@/components/ui/LinkArrow'

export function HouseIntro() {
  return (
    <Section field="pearl">
      <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        <Display size="lg" as="h2" className="max-w-[14ch]">
          Thirty-three years at the same bench.
        </Display>
        <div>
          <Body>
            Shri Ashok Kumar Bansal opened the workshop in 1993 with one belief: that jewellery is not
            an ornament but a part of a family&rsquo;s life — worn at weddings, passed to daughters,
            remembered long after. Three decades on, many of the families who came to us in the first
            years now send their children. That is the only measure of success we have ever kept.
          </Body>
          <div className="mt-8">
            <LinkArrow href="/legacy">Our legacy</LinkArrow>
          </div>
        </div>
      </div>
    </Section>
  )
}
