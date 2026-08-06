import type { Metadata } from 'next'
import { getSettings } from '@/lib/client-content'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

// Legal/structural name only in <title> and metadata — never "the House of
// Bansal" (editorial prose) here (CLAUDE.md).
const { data: settings } = getSettings()

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? settings.domain),
  title: {
    default: `${settings.legalName} — Fine Jewellery, New Delhi`,
    template: `%s — ${settings.legalName}`,
  },
  description:
    'A family jewellery maison in South Delhi. Made under one roof since 1993. By private appointment.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-pearl text-charcoal antialiased">{children}</body>
    </html>
  )
}
