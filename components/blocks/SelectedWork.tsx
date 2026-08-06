// Selected work (docs/04 § Home #4). Pearl-deep. Six featured pieces, 4:5,
// reference beneath. No prices, no per-card enquiry. One link out.
import { Section } from '@/components/layout/Section'
import { Display, Label } from '@/components/type'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { PieceCard } from '@/components/blocks/PieceCard'
import { featuredPieces } from '@/lib/pieces'

export async function SelectedWork() {
  const pieces = await featuredPieces(6)
  if (pieces.length === 0) return null

  return (
    <Section field="pearl-deep">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Label className="block">Selected work</Label>
          <Display size="md" as="h2" className="mt-4">
            A few pieces we have made.
          </Display>
        </div>
        <LinkArrow href="/collections" className="shrink-0">
          View the collections
        </LinkArrow>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {pieces.map((p) => (
          <PieceCard key={p.reference} piece={p} />
        ))}
      </div>
    </Section>
  )
}
