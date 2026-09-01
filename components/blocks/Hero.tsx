// Home hero (docs/04 § Home #1) — image-led, dark and warm, as in the render.
// A full-bleed espresso field carries the piece; the copy sits over it in cream.
// Real photography drops straight into the background slot.
import { getSettings } from '@/lib/client-content'
import { Container } from '@/components/layout/Container'
import { Display, Lede, Label } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'
import { LinkArrow } from '@/components/ui/LinkArrow'

export function Hero({ headline, lede }: { headline?: string; lede?: string } = {}) {
  const { data: s } = getSettings()
  return (
    <section className="relative isolate overflow-hidden bg-obsidian text-pearl">
      {/* Real photograph of the showroom interior (the one confirmed image). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/house/showroom-interior.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/30" />

      <Container className="relative flex min-h-[82vh] flex-col justify-center py-24">
        <Label gold className="block">
          Goldsmiths &amp; jewellers · {s.metro.station} · Since {s.foundedYear}
        </Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[15ch] text-pearl">
          {headline ?? 'Before there is jewellery, there is trust.'}
        </Display>
        <Lede className="mt-8 text-stone-light">
          {lede ??
            'A heritage jewellery outlet in South Delhi, in its third generation. Every piece we sell, we have made. Every stone we set, we can account for.'}
        </Lede>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonGhost onDark href="/appointment">Request a private appointment</ButtonGhost>
          <LinkArrow onDark href="/craftsmanship">See how a piece is made</LinkArrow>
        </div>
      </Container>
    </section>
  )
}
