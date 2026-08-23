// /journal/[slug] — an article (docs/04 § Journal). Reads a published post from
// D1; body is the 3-rule markdown-lite; cover from R2. max-w-68ch, no reading time.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Display, Body, Label } from '@/components/type'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { Placeholder } from '@/components/ui/Placeholder'
import { JournalBody } from '@/components/JournalBody'
import { JournalCard } from '@/components/blocks/JournalCard'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getSettings } from '@/lib/client-content'
import { journalPost, relatedPosts, JOURNAL_CATEGORIES } from '@/lib/journal'

export const dynamic = 'force-dynamic'

const CAT_LABEL = Object.fromEntries(JOURNAL_CATEGORIES.map((c) => [c.value, c.label]))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await journalPost(slug)
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
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
  const { data: s } = getSettings()

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Journal', path: '/journal' }, { name: post.title, path: `/journal/${post.slug}` }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          author: post.author ? { '@type': 'Person', name: post.author } : undefined,
          publisher: { '@type': 'Organization', name: s.legalName },
        }}
      />
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
          {post.coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverSrc} alt={post.coverAlt} className="h-auto w-full" />
          ) : (
            <Placeholder ratio="3:2" ground="charcoal" label={`${post.title} — cover`} />
          )}
        </Container>
      </Section>

      {/* Body */}
      <Section field="pearl">
        <Container className="!max-w-[68ch] !px-[var(--spacing-gutter)]">
          {post.body.trim() ? <JournalBody body={post.body} /> : <Body muted>This article is being written.</Body>}
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
