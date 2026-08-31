// /collections/[slug]/[piece] — a named piece (change round D). Heading is the
// piece's name, then its subtitle and prose description. The maker's dossier
// (D2) and the PLACEHOLDER paragraph (D4) are removed. Image left (sticky), copy
// right. No enquiry action, no price, no "similar pieces".
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Display, Body, Label } from '@/components/type'
import { Placeholder } from '@/components/ui/Placeholder'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { pieceDetail, allPieceParams } from '@/lib/collections'

// Dynamic so admin edits to a piece appear immediately; known slugs pre-render,
// new ones render on demand.
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return allPieceParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; piece: string }> }): Promise<Metadata> {
  const { slug, piece } = await params
  const d = await pieceDetail(slug, piece)
  if (!d) return {}
  return {
    title: d.subtitle ? `${d.name} — ${d.subtitle}` : d.name,
    description: d.description?.replace(/\s+/g, ' ').trim().slice(0, 155),
  }
}

export default async function PiecePage({ params }: { params: Promise<{ slug: string; piece: string }> }) {
  const { slug, piece } = await params
  const d = await pieceDetail(slug, piece)
  if (!d) notFound()

  const paragraphs = (d.description ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim().replace(/\n/g, ' '))
    .filter(Boolean)

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }, { name: d.collectionSlug, path: `/collections/${d.collectionSlug}` }, { name: d.name, path: `/collections/${d.collectionSlug}/${d.slug}` }])} />
      <LinkArrow href={`/collections/${d.collectionSlug}`}>Back to the collection</LinkArrow>

      <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
        {/* Images — the uploaded photography, sticky on desktop. Placeholder only
            when a piece has no photographs yet. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {d.images.length > 0 ? (
            <div className="space-y-4">
              {d.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="w-full bg-charcoal object-cover"
                />
              ))}
            </div>
          ) : (
            <Placeholder ratio="4:5" ground="charcoal" label={d.name} />
          )}
        </div>

        {/* The piece */}
        <div>
          <Display size="lg" as="h1">
            {d.name}
          </Display>
          {d.subtitle && <Label className="mt-3 block">{d.subtitle}</Label>}
          {paragraphs.length > 0 && (
            <div className="mt-8 max-w-[54ch] space-y-5">
              {paragraphs.map((p, i) => (
                <Body key={i} className="text-stone">
                  {p}
                </Body>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
