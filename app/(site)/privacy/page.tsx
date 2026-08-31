// /privacy (docs/04 § Privacy). Plain-language, short. From 08-privacy.md
// (draft — needs legal review against the DPDP Act, 2023).
import type { Metadata } from 'next'
import { getPrivacy } from '@/lib/client-content'
import { resolveDocument } from '@/lib/documents'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Display, Label } from '@/components/type'
import { Prose } from '@/components/Prose'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What we collect when you request an appointment, how it is stored, and how to request deletion.',
  robots: { index: true, follow: true },
  ...canonical('/privacy'),
}

export default async function PrivacyPage() {
  const { _meta } = getPrivacy()
  const body = await resolveDocument('privacy')
  return (
    <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
      <Container className="!max-w-[68ch] !px-[var(--spacing-gutter)]">
        <Label className="block">
          Privacy
          <DraftFlag meta={_meta} />
        </Label>
        <Display size="lg" as="h1" className="mt-4">
          Your details, and what we do with them.
        </Display>
        <div className="mt-10">
          <Prose markdown={body} />
        </div>
      </Container>
    </Section>
  )
}
