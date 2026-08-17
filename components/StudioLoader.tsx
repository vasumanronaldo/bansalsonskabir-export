'use client'

// Client boundary that lazy-loads the Studio with ssr:false. Keeps Sanity out of
// the server bundle (Cloudflare Workers has a hard size limit) — the Studio is a
// browser-only SPA anyway.
import nextDynamic from 'next/dynamic'

const StudioClient = nextDynamic(() => import('@/components/StudioClient'), {
  ssr: false,
  loading: () => null,
})

export default function StudioLoader() {
  return <StudioClient />
}
