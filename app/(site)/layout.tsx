// Site chrome (Header + Footer) for all public pages. /studio and /kitchen-sink
// sit outside this group and don't get it. Wordmark comes from the loader.
import { getSettings } from '@/lib/client-content'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data } = getSettings()
  return (
    <>
      <Header wordmark={data.legalName} />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
