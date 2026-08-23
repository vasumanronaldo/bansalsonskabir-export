// Site chrome (Header + Footer) for all public pages. /studio and /kitchen-sink
// sit outside this group and don't get it. Wordmark comes from the loader.
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Public pages read live content + settings from D1 per request, so admin edits
// appear immediately. D1 reads are cheap; each getter falls back to committed
// content if the DB is unavailable.
export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
