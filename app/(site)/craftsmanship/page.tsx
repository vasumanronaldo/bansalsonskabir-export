// /craftsmanship — the proof page (docs/04 § Craftsmanship). The longest page:
// the ordered process (01–08), a plain-English certificate explainer, and the
// honest price + aftercare breakdowns from markdown (which carry [TK] values and
// will — correctly — fail content:status --strict until the family confirms them).
import type { Metadata } from 'next'
import { getPricing, getAftercare } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Body, Label } from '@/components/type'
import { Prose } from '@/components/Prose'
import { ProcessSequence } from '@/components/blocks/ProcessSequence'
import { CtaBand } from '@/components/blocks/CtaBand'

export const metadata: Metadata = {
  title: 'Craftsmanship',
  description: 'From a sketch on paper to a piece in a box — made under one roof, and billed in front of you.',
}

export default function CraftsmanshipPage() {
  const pricing = getPricing()
  const aftercare = getAftercare()

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Craftsmanship</Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[20ch]">
          From a sketch on paper to a piece in a box.
        </Display>
      </Section>

      {/* The sequence — numbered 01–08 (correct here and only here) */}
      <Section field="pearl">
        <Label className="mb-10 block">The sequence</Label>
        <ProcessSequence numbered withImages />
      </Section>

      {/* How to read a certificate */}
      <Section field="obsidian">
        <div className="max-w-[64ch]">
          <Label gold className="block">How to read a certificate</Label>
          <Display size="md" as="h2" className="mt-4 text-pearl">
            What the paper actually guarantees.
          </Display>
          <div className="mt-8 space-y-6">
            <Lede className="text-stone-light">
              A diamond&rsquo;s worth is graded on four things — the 4Cs. <strong className="font-medium text-pearl">Carat</strong> is
              weight. <strong className="font-medium text-pearl">Colour</strong> runs from D (colourless) down the alphabet as a
              faint yellow appears. <strong className="font-medium text-pearl">Clarity</strong> describes the tiny inclusions inside
              the stone. <strong className="font-medium text-pearl">Cut</strong> is how well it has been faceted to return light —
              the one C the human hand controls, and the one most often compromised to save weight.
            </Lede>
            <Body className="text-stone-light">
              We sell natural stones only, certified by <strong className="font-medium text-pearl">GIA</strong> or{' '}
              <strong className="font-medium text-pearl">IGI</strong>. The report number is laser-inscribed on the girdle of the
              stone, so the certificate and the diamond cannot be separated. We do not sell lab-grown stones as
              natural — they are a different product, and pricing them as if they were mined is dishonest.
            </Body>
            <Body className="text-stone-light">
              Every gold piece is <strong className="font-medium text-pearl">BIS hallmarked</strong> and carries a{' '}
              <strong className="font-medium text-pearl">HUID</strong> — a six-character Hallmark Unique ID registered against the
              piece. The hallmark certifies the purity of the gold; the HUID makes that certification traceable
              to your specific piece. Both are checked in front of you.
            </Body>
          </div>
        </div>
      </Section>

      {/* How a price is built */}
      <Section field="pearl-deep">
        <div className="max-w-[68ch]">
          <Label className="block">
            How a price is built
            <DraftFlag meta={pricing._meta} />
          </Label>
          <div className="mt-8">
            <Prose markdown={pricing.body} />
          </div>
        </div>
      </Section>

      {/* Aftercare & buyback */}
      <Section field="pearl">
        <div className="max-w-[68ch]">
          <Label className="block">
            Aftercare &amp; buyback
            <DraftFlag meta={aftercare._meta} />
          </Label>
          <div className="mt-8">
            <Prose markdown={aftercare.body} />
          </div>
        </div>
      </Section>

      <CtaBand
        heading="Ask us anything before you buy."
        body="Bring a certificate you already have, or a piece you want understood. We will read it with you."
      />
    </>
  )
}
