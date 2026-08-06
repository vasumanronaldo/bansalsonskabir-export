import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSettings } from '@/lib/client-content'
import { fontVariables } from '@/lib/fonts'
import { jewelryStoreJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import './globals.css'

// Legal/structural name only in <title> and metadata — never "the House of
// Bansal" (editorial prose) here (CLAUDE.md).
const { data: settings } = getSettings()

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? settings.domain),
  title: {
    default: `${settings.legalName} — Fine Jewellery & Bespoke Commissions, Malviya Nagar, New Delhi`,
    template: `%s — ${settings.legalName}`,
  },
  description:
    'A family jewellery maison in South Delhi, making under one roof since 1993. Natural diamonds, polki, kundan and bespoke commissions — by private appointment.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: settings.legalName,
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVariables}>
      <body className="min-h-dvh bg-pearl text-charcoal antialiased">
        <JsonLd data={jewelryStoreJsonLd(settings)} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
