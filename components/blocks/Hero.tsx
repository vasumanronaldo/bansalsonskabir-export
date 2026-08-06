// Home hero (docs/04 § Home #1). Pearl, no hero image at launch — negative space
// holds until a full-bleed workshop photograph is shot. Above the fold, so no
// Framer here: it stays out of the homepage JS budget.
import { getSettings } from '@/lib/client-content'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Label } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'
import { LinkArrow } from '@/components/ui/LinkArrow'

export function Hero() {
  // Locality + founding year come from the loader — never hardcoded (CLAUDE.md).
  const { data: s } = getSettings()
  return (
    <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
      <Label className="block">
        Goldsmiths &amp; jewellers · {s.metro.station} · Since {s.foundedYear}
      </Label>
      <Display size="xl" as="h1" className="mt-6 max-w-[16ch]">
        Before there is jewellery, there is trust.
      </Display>
      <Lede className="mt-8">
        A family workshop in South Delhi, in its third generation. Every piece we sell, we have made.
        Every stone we set, we can account for.
      </Lede>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <ButtonGhost href="/appointment">Request a private appointment</ButtonGhost>
        <LinkArrow href="/craftsmanship">See how a piece is made</LinkArrow>
      </div>
    </Section>
  )
}
