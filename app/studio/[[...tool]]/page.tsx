// Sanity Studio, embedded (docs/03 § Routes). Rendered browser-only via
// StudioLoader so the Studio bundle stays out of the Cloudflare Worker server
// bundle (Workers has a hard size limit). noindex.
import StudioLoader from '@/components/StudioLoader'

export const dynamic = 'force-static'
export const metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return <StudioLoader />
}
