// Home (docs/04 § Home). One scroll: convince a sceptical referred visitor the
// house is honest and skilled, then offer an appointment. Product comes last.
// Section rhythm: pearl → pearl → obsidian → pearl-deep → pearl → charcoal.
import { Hero } from '@/components/blocks/Hero'
import { Proofs } from '@/components/blocks/Proofs'
import StandardManifestoLazy from '@/components/blocks/StandardManifestoLazy'
import { SelectedWork } from '@/components/blocks/SelectedWork'
import { HouseIntro } from '@/components/blocks/HouseIntro'
import { AppointmentCta } from '@/components/blocks/AppointmentCta'
import type { Metadata } from 'next'
import { getPageBlocks } from '@/lib/blocks'
import { withSeoOverride } from '@/lib/admin/settings-db'

// Dynamic so the family's page-copy edits show without a rebuild. One cheap D1
// read per request; if it fails, getPageBlocks returns the committed defaults.
export const dynamic = 'force-dynamic'

// Home inherits the layout title/description unless the family overrides them.
export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride('home', {})
}

export default async function HomePage() {
  const b = await getPageBlocks('home')
  const proofs = [1, 2, 3, 4, 5].map((i) => ({ heading: b[`home.proof.${i}.heading`]!, body: b[`home.proof.${i}.body`]! }))
  const standard = [1, 2, 3, 4, 5, 6].map((i) => b[`home.standard.${i}`]!)
  return (
    <>
      <Hero headline={b['home.hero.headline']} lede={b['home.hero.lede']} />
      <Proofs items={proofs} />
      <StandardManifestoLazy lines={standard} />
      <SelectedWork />
      <HouseIntro />
      <AppointmentCta />
    </>
  )
}
