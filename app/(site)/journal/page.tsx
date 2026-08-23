// /journal — index (docs/04 § Journal). Editorial, not SEO filler.
import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Label } from '@/components/type'
import { JournalIndex } from '@/components/blocks/JournalIndex'
import { NewsletterSignup } from '@/components/blocks/NewsletterSignup'
import { journalIndex } from '@/lib/journal'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Journal',
  description: 'How to buy well, inside the workshop, and the history of the house.',
}

export default async function JournalPage() {
  const posts = await journalIndex()

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Journal</Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[16ch]">
          Worth reading, not written for search engines.
        </Display>
        <Lede className="mt-8">
          How to buy well, what happens at the bench, and the history of a house that has kept the same name
          since 1993.
        </Lede>
      </Section>

      <Section field="pearl">
        <JournalIndex posts={posts} />
      </Section>

      <NewsletterSignup />
    </>
  )
}
