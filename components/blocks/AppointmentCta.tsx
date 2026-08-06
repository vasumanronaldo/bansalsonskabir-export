// Appointment invitation (docs/04 § Home #6). Charcoal feature ground — the
// closing CTA. ButtonGhost only; no urgency, no form here.
import { Section } from '@/components/layout/Section'
import { Display, Body } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'

export function AppointmentCta() {
  return (
    <Section field="charcoal">
      <div className="max-w-[52ch]">
        <Display size="lg" as="h2" className="text-pearl">
          Come and sit with us.
        </Display>
        <Body className="mt-6 text-stone-light">
          There is no obligation and there is no queue. Tell us what the occasion is and we will keep an
          hour aside. Walk-ins are always welcome, but an appointment means the person who will make your
          piece is at the table.
        </Body>
        <div className="mt-10">
          <ButtonGhost onDark href="/appointment">
            Request a private appointment
          </ButtonGhost>
        </div>
      </div>
    </Section>
  )
}
