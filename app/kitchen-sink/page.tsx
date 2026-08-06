// Kitchen sink — DEV ONLY. Renders every design primitive at every size so the
// system can be critiqued in one place. Hard-guarded out of production builds.
import { notFound } from 'next/navigation'
import { getSettings } from '@/lib/client-content'
import { Container } from '@/components/layout/Container'
import { Hairline } from '@/components/layout/Hairline'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Display, Lede, Body, Label } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { Placeholder } from '@/components/ui/Placeholder'
import { MotionSample } from './MotionSample'

export const metadata = { robots: { index: false, follow: false }, title: 'Kitchen Sink (dev)' }

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--color-hairline)] py-12">
      <Label className="mb-6 block">{title}</Label>
      {children}
    </section>
  )
}

export default function KitchenSink() {
  if (process.env.NODE_ENV === 'production') notFound()
  const { data: settings } = getSettings()

  return (
    <>
      <Header wordmark={settings.legalName} />
      <main>
        <Container className="py-16">
          <Label gold>Design system · kitchen sink</Label>
          <Display size="xl" as="h1" className="mt-4">
            The showroom, translated.
          </Display>
        </Container>

        <Container>
          <Row title="Display — Bodoni Moda">
            <div className="space-y-6">
              <Display size="xl">Display XL — clamp 2.75→5.5rem</Display>
              <Display size="lg">Display LG — clamp 2.25→3.75rem</Display>
              <Display size="md">Display MD — clamp 1.75→2.5rem</Display>
              <Display size="sm">Display SM — clamp 1.25→1.5rem</Display>
            </div>
          </Row>

          <Row title="Body — Archivo">
            <div className="space-y-4">
              <Lede>
                Lede / body-lg. A jeweller explaining something across a table — not a brand talking at
                you. Measure is capped at sixty-two characters so the line never runs long.
              </Lede>
              <Body>
                Body / base. Quiet, specific, factual. Every image sits on charcoal or stone, never a
                white sweep, and the gold appears only as a hairline.
              </Body>
              <Body size="sm" muted>
                Body-sm / caption, muted stone. Notes, captions, and secondary detail.
              </Body>
            </div>
          </Row>

          <Row title="Labels — IBM Plex Mono">
            <div className="flex flex-wrap items-center gap-6">
              <Label>Label · 0.16em</Label>
              <Label size="lg">Label LG · 0.12em</Label>
              <Label gold>Gold accent label</Label>
            </div>
          </Row>

          <Row title="Buttons — ButtonGhost (the only button)">
            <div className="flex flex-wrap items-center gap-4">
              <ButtonGhost href="/appointment">Request an appointment</ButtonGhost>
              <ButtonGhost>Button element</ButtonGhost>
            </div>
          </Row>

          <Row title="Links — LinkArrow">
            <div className="flex flex-wrap items-center gap-8">
              <LinkArrow href="/collections">View the collections</LinkArrow>
              <LinkArrow href="/craftsmanship">How a piece is made</LinkArrow>
            </div>
          </Row>

          <Row title="Hairlines">
            <div className="space-y-6">
              <Hairline />
              <Hairline tone="gold" />
            </div>
          </Row>

          <Row title="Placeholders — until real photography exists">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Placeholder ratio="4:5" label="A finished piece on charcoal" />
              <Placeholder ratio="3:2" ground="obsidian" label="The workshop bench" />
              <Placeholder ratio="1:1" ground="stone" label="Detail — a setting" />
            </div>
          </Row>

          <Row title="Motion — entrance + stagger (reduced-motion safe)">
            <MotionSample />
          </Row>
        </Container>

        {/* Dark-field variants (obsidian ground) */}
        <section className="mt-16 bg-obsidian py-16 text-pearl">
          <Container>
            <Label gold className="mb-6 block">
              On dark
            </Label>
            <Display size="md" className="text-pearl">
              Feature sections invert to pearl text.
            </Display>
            <Body className="mt-4 text-stone-light">
              Secondary text is stone-light; the accent is gold-soft; rules are the inverse hairline.
            </Body>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonGhost onDark href="/appointment">
                Request an appointment
              </ButtonGhost>
              <LinkArrow onDark href="/collections">
                View the collections
              </LinkArrow>
            </div>
            <div className="mt-8">
              <Hairline tone="inverse" />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
