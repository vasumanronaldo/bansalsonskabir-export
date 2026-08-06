// Home (docs/04 § Home). One scroll: convince a sceptical referred visitor the
// house is honest and skilled, then offer an appointment. Product comes last.
// Section rhythm: pearl → pearl → obsidian → pearl-deep → pearl → charcoal.
import { Hero } from '@/components/blocks/Hero'
import { Proofs } from '@/components/blocks/Proofs'
import StandardManifestoLazy from '@/components/blocks/StandardManifestoLazy'
import { SelectedWork } from '@/components/blocks/SelectedWork'
import { HouseIntro } from '@/components/blocks/HouseIntro'
import { AppointmentCta } from '@/components/blocks/AppointmentCta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Proofs />
      <StandardManifestoLazy />
      <SelectedWork />
      <HouseIntro />
      <AppointmentCta />
    </>
  )
}
