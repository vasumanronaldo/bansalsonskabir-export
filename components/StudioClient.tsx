'use client'

// The heavy Sanity Studio, isolated in a client component. Loaded only in the
// browser (see StudioLoader) so the ~5 MB of `sanity`/`next-sanity` never enters
// the Cloudflare Worker server bundle — it ships as a static asset instead.
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioClient() {
  return <NextStudio config={config} />
}
