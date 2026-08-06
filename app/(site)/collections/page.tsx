// /collections — index of categories (docs/04 § Collections). Category cards;
// no prices, no enquiry action.
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Body, Label } from '@/components/type'
import { Placeholder } from '@/components/ui/Placeholder'
import { collectionsIndex } from '@/lib/collections'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Pieces we have made — one of a kind, many already gone home. Here to show what is possible.',
}

export default async function CollectionsPage() {
  const collections = await collectionsIndex()

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Collections</Label>
        <Display size="xl" as="h1" className="mt-6 max-w-[16ch]">
          What we have made.
        </Display>
        <Lede className="mt-8">
          These are pieces we have made. Most are one of a kind and many have already gone home with someone.
          They are here to show what is possible, not to be ordered from a page.
        </Lede>
      </Section>

      <Section field="pearl">
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Placeholder ratio="4:5" ground="charcoal" label={`${c.title} — collection`} />
              <div className="mt-4">
                <Display size="sm" as="h2" className="transition-colors duration-200 group-hover:text-gold">
                  {c.title}
                </Display>
                {c.shortDescription && (
                  <Body size="sm" muted className="mt-2">
                    {c.shortDescription}
                  </Body>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
