// /journal/[slug] — an article (docs/04 § Journal). max-w-68ch, portable text,
// author + date in mono, related posts at foot. No reading time.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Display, Body, Label } from '@/components/type'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { Placeholder } from '@/components/ui/Placeholder'
import { PortableTextBody } from '@/components/PortableTextBody'
import { JournalCard } from '@/components/blocks/JournalCard'
import { journalPost, relatedPosts, allJournalParams, JOURNAL_CATEGORIES } from '@/lib/journal'
import { urlFor } from '@/sanity/lib/image'

const CAT_LABEL = Object.fromEntries(JOURNAL_CATEGORIES.map((c) => [c.value, c.label]))

export async function generateStaticParams() {
  return allJournalParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await journalPost(slug)
  if (!post) return {}
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await journalPost(slug)
  if (!post) notFound()
  const related = await relatedPosts(post.category, post.slug, 3)

  return (
    <>
      <Section field="pearl" className="pt-[clamp(2.5rem,6vw,5rem)]">
        <Container className="!max-w-[68ch] !px-[var(--spacing-gutter)]">
          <LinkArrow href="/journal">Back to the journal</LinkArrow>
          <div className="mt-8 flex items-center gap-3">
            {post.category && <Label gold>{CAT_LABEL[post.category] ?? post.category}</Label>}
            {post.publishedAt && (
              <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] tracking-[0.12em] text-stone">
                {fmtDate(post.publishedAt)}
                {post.author ? ` · ${post.author}` : ''}
              </span>
            )}
          </div>
          <Display size="lg" as="h1" className="mt-5">
            {post.title}
          </Display>
        </Container>
      </Section>

      {/* Cover */}
      <Section field="pearl" className="!py-0">
        <Container className="!max-w-[80ch]">
          {post.coverImage?.asset ? (
            <Image
              src={urlFor(post.coverImage).width(1600).height(900).fit('crop').url()}
              alt={post.title}
              width={1600}
              height={900}
              priority
              sizes="(max-width: 900px) 100vw, 80ch"
              className="h-auto w-full"
            />
          ) : (
            <Placeholder ratio="3:2" ground="charcoal" label={`${post.title} — cover`} />
          )}
        </Container>
      </Section>

      {/* Body */}
      <Section field="pearl">
        <Container className="!max-w-[68ch] !px-[var(--spacing-gutter)]">
          {post.body ? <PortableTextBody value={post.body} /> : <Body muted>This article is being written.</Body>}
        </Container>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section field="pearl-deep">
          <Label className="mb-10 block">More from the journal</Label>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
            {related.map((p) => (
              <JournalCard key={p._id} post={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
