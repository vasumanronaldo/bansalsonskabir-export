// Journal card (docs/02, docs/04 § Journal). Editorial, not e-commerce.
import Image from 'next/image'
import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { Display, Body, Label } from '@/components/type'
import { urlFor } from '@/sanity/lib/image'
import { JOURNAL_CATEGORIES } from '@/lib/journal'
import type { JournalCard as JournalCardData } from '@/sanity/queries'

const CAT_LABEL = Object.fromEntries(JOURNAL_CATEGORIES.map((c) => [c.value, c.label]))

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function JournalCard({ post }: { post: JournalCardData }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {post.coverImage?.asset ? (
        <div className="aspect-[3/2] overflow-hidden bg-charcoal">
          <Image
            src={urlFor(post.coverImage).width(900).height(600).fit('crop').url()}
            alt={post.title}
            width={900}
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <Placeholder ratio="3:2" ground="charcoal" label={`${post.title} — cover`} />
      )}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          {post.category && <Label gold>{CAT_LABEL[post.category] ?? post.category}</Label>}
          {post.publishedAt && <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] tracking-[0.12em] text-stone">{fmtDate(post.publishedAt)}</span>}
        </div>
        <Display size="sm" as="h2" className="mt-3 transition-colors duration-200 group-hover:text-gold">
          {post.title}
        </Display>
        {post.excerpt && (
          <Body size="sm" muted className="mt-2">
            {post.excerpt}
          </Body>
        )}
      </div>
    </Link>
  )
}
