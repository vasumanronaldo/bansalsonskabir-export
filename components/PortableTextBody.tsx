// Portable-text renderer for journal articles (docs/04 § Journal). Pull-quotes
// in Bodoni; measured body; images via the Sanity pipeline. No raw HTML.
import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/image'
import type { ImageSource } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-6 font-[family-name:var(--font-body)] text-[length:var(--text-body-lg)] leading-[1.75] text-charcoal">{children}</p>,
    h2: ({ children }) => <h2 className="mt-12 font-[family-name:var(--font-display)] text-[length:var(--text-display-md)] leading-[1.15]">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-10 font-[family-name:var(--font-display)] text-[length:var(--text-display-sm)]">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l border-gold pl-6 font-[family-name:var(--font-display)] text-[length:var(--text-display-sm)] leading-[1.3] text-charcoal">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-gold underline-offset-4 hover:underline" rel="noreferrer noopener">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="my-10">
        <Image
          src={urlFor(value as ImageSource).width(1200).url()}
          alt={(value?.alt as string) || ''}
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, 68ch"
          className="h-auto w-full"
        />
      </figure>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-6 ml-5 list-disc space-y-2 text-charcoal">{children}</ul>,
    number: ({ children }) => <ol className="mt-6 ml-5 list-decimal space-y-2 text-charcoal">{children}</ol>,
  },
}

export function PortableTextBody({ value }: { value: unknown[] }) {
  return <PortableText value={value as never} components={components} />
}
