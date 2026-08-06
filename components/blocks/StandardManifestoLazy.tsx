'use client'

// Loads the signature (and Framer Motion with it) as a separate client chunk —
// keeps Framer out of the homepage's initial JS budget (< 120kb). The block is
// below the fold and revealed on scroll, so ssr:false is fine here. A reserved
// obsidian plate holds the space to avoid layout shift.
import dynamic from 'next/dynamic'

const Inner = dynamic(() => import('./StandardManifesto'), {
  ssr: false,
  loading: () => <div aria-hidden className="bg-obsidian" style={{ minHeight: '60vh' }} />,
})

export default function StandardManifestoLazy() {
  return <Inner />
}
