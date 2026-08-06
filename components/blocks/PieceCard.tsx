// PieceCard (docs/02, docs/04). Image (4:5, Placeholder until a real photograph
// exists), title, reference in mono beneath, optional status chip. NO enquiry
// action, no price — ever. Links to the maker's dossier.
import Image from 'next/image'
import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { urlFor } from '@/sanity/lib/image'
import type { ImageRef } from '@/sanity/queries'

export interface PieceCardData {
  title: string
  reference: string
  slug: string
  collectionSlug: string
  status?: string
  placeholderLabel?: string
  image?: ImageRef | null
}

const STATUS_CHIP: Record<string, string> = { sold: 'Sold', inWorkshop: 'At the bench' }

export function PieceCard({ piece }: { piece: PieceCardData }) {
  const chip = piece.status ? STATUS_CHIP[piece.status] : undefined
  const href = `/collections/${piece.collectionSlug}/${piece.slug}`

  return (
    <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
      <div className="relative">
        {piece.image?.asset ? (
          <div className="aspect-[4/5] overflow-hidden bg-charcoal">
            <Image
              src={urlFor(piece.image).width(800).height(1000).fit('crop').url()}
              alt={piece.title}
              width={800}
              height={1000}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <Placeholder ratio="4:5" label={piece.placeholderLabel || `${piece.title} — ${piece.reference}`} />
        )}
        {chip && (
          <span className="absolute left-3 top-3 bg-obsidian/85 px-2 py-1 font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-pearl">
            {chip}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-charcoal">{piece.title}</p>
        <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-stone">
          {piece.reference}
        </p>
      </div>
    </Link>
  )
}
