// /bespoke — Bespoke Atelier (docs/04 § Bespoke + build-order Phase 6). The
// process is documented once, on Craftsmanship (X5), and linked from here; the
// published commission terms (11-commission-terms.md) are a deliberate
// differentiator — most houses never publish them.
import type { Metadata } from 'next'
import { getCommissionTerms } from '@/lib/client-content'
import { resolveDocument } from '@/lib/documents'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Body, Label } from '@/components/type'
import { Prose } from '@/components/Prose'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { CtaBand } from '@/components/blocks/CtaBand'

export const metadata: Metadata = {
  title: 'Bespoke Atelier',
  description: 'A commission starts with a conversation, not a catalogue. Made to a family, not to a season.',
}

export default async function BespokePage() {
  const terms = { ...getCommissionTerms(), body: await resolveDocument('commission-terms') }

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Bespoke atelier</Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[18ch]">
          Made to a family, not to a season.
        </Display>
        <Lede className="mt-8">
          A commission starts with a conversation, not a catalogue. Bring a photograph, a drawing, an old
          piece you want reworked, or nothing at all. We will sketch, price it openly, and show you the piece
          in progress before it is finished. Most commissions take two to four weeks.
        </Lede>
      </Section>

      {/* X5: the process is documented once, on Craftsmanship — link, don't duplicate */}
      <Section field="pearl-deep">
        <Label className="mb-6 block">The journey</Label>
        <Body className="max-w-[52ch]">
          A commission runs through the same eight steps as everything we make.
        </Body>
        <div className="mt-6">
          <LinkArrow href="/craftsmanship">See how a piece is made</LinkArrow>
        </div>
      </Section>

      {/* Remodelling */}
      <Section field="pearl">
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-[16rem_1fr]">
          <Label className="pt-1">Remodelling</Label>
          <div className="space-y-6">
            <Body>
              An inherited piece is not raw material. When we rework one, your original gold and your original
              stones are weighed in front of you, retained, and returned in the new piece — or handed back to
              you if they are not used.
            </Body>
            <Body>
              Nothing is melted without your consent. You will see the weights before and after, and the piece
              in progress along the way. What leaves with you is the same gold that came in, in a form your
              family will wear again.
            </Body>
          </div>
        </div>
      </Section>

      {/* Published commission terms — the differentiator */}
      <Section field="obsidian">
        <div className="max-w-[68ch]">
          <Label gold className="block">
            The terms, before you come in
            <DraftFlag meta={terms._meta} />
          </Label>
          <div className="mt-8">
            <Prose markdown={terms.body} onDark />
          </div>
        </div>
      </Section>

      <CtaBand
        heading="Begin with a conversation."
        body="Tell us what the piece is for. We will sketch, price it openly, and show you as it is made."
        href="/appointment?interest=bespoke"
        label="Start a commission"
      />
    </>
  )
}
