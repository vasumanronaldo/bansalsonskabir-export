// 404 (docs/04 § not-found). No illustration, no humour. Rendered with the site
// chrome so a lost visitor still has the header, footer and a way back.
import Link from 'next/link'
import { getSettings } from '@/lib/client-content'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Container } from '@/components/layout/Container'
import { Display, Body } from '@/components/type'

export default function NotFound() {
  const { data } = getSettings()
  return (
    <>
      <Header wordmark={data.legalName} />
      <main id="main">
        <Container className="py-[clamp(5rem,12vw,10rem)]">
          <Display size="lg" as="h1" className="max-w-[18ch]">
            This piece is no longer here.
          </Display>
          <Body className="mt-6">
            The page you were looking for has moved or was never made. The collections are a good place to
            start again.
          </Body>
          <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3" aria-label="Recover">
            {[
              { href: '/', label: 'Home' },
              { href: '/collections', label: 'Collections' },
              { href: '/appointment', label: 'Appointment' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] uppercase tracking-[0.12em] text-charcoal underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </Container>
      </main>
      <Footer />
    </>
  )
}
