// /collections/[slug] — a collection lookbook (docs/04 § Collections). Intro,
// then a 4:5 grid. No prices, no per-piece enquiry. ONE CTA at the foot only,
// with no ?ref parameter (docs/07 § E2).
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { lookupRedirect } from '@/lib/redirects'
import { Section } from '@/components/layout/Section'
import { Display, Lede, Label } from '@/components/type'
import { PieceCard } from '@/components/blocks/PieceCard'
import { CtaBand } from '@/components/blocks/CtaBand'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { collectionWithPieces, allCollectionParams } from '@/lib/collections'

// Dynamic so admin edits to the catalogue appear immediately; params below still
// pre-render the known slugs, and unknown ones render on demand.
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return allCollectionParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await collectionWithPieces(slug)
  if (!data) return {}
  return {
    title: `${data.collection.title} — Collections`,
    description: data.collection.shortDescription ?? `${data.collection.title} pieces made by Bansal Sons.`,
  }
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await collectionWithPieces(slug)
  if (!data) {
    const to = await lookupRedirect(`/collections/${slug}`)
    if (to) redirect(to)
    notFound()
  }
  const { collection, intro, pieces } = data

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }, { name: collection.title, path: `/collections/${collection.slug}` }])} />
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">Collection</Label>
        <Display size="xl" as="h1" className="mt-6">
          {collection.title}
        </Display>
        {intro && <Lede className="mt-8">{intro}</Lede>}
      </Section>

      <Section field="pearl">
        {pieces.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {pieces.map((p) => (
              <PieceCard key={p.slug} piece={p} />
            ))}
          </div>
        ) : (
          <Lede className="text-stone">Pieces from this collection are being photographed. Come and see them in person.</Lede>
        )}
      </Section>

      <CtaBand
        heading="Ask about a piece from this collection."
        body="Tell us what caught your eye. Most pieces are one of a kind; we can show you what is possible."
        label="Ask about a piece"
      />
    </>
  )
}
