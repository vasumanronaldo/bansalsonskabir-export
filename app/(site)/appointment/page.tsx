// /appointment (docs/04 § Appointment) — the primary conversion. Form beside an
// obsidian panel carrying the full address, hours and contact, so a visitor
// deciding whether to come never has to navigate away. Contact + FAQ from the
// loader; nothing hardcoded.
import type { Metadata } from 'next'
import { getSettings } from '@/lib/client-content'
import { getFaqItems } from '@/lib/house-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Container } from '@/components/layout/Container'
import { Display, Label } from '@/components/type'
import { AppointmentForm } from '@/components/blocks/AppointmentForm'

export const metadata: Metadata = {
  title: 'Request a private appointment',
  description: 'Book a private appointment at Bansal Sons Jewellers, Malviya Nagar. No obligation, no queue.',
}

function prettyPhone(raw: string) {
  const m = raw.match(/^(\+91)(\d{5})(\d{5})$/)
  return m ? `${m[1]} ${m[2]} ${m[3]}` : raw
}

export const dynamic = 'force-dynamic'

export default async function AppointmentPage() {
  const { data: s, _meta } = getSettings()
  const visiting = (await getFaqItems()).filter((f) => f.group === 'visiting')

  return (
    <Container className="py-[clamp(3rem,7vw,6rem)]">
      <div className="max-w-[52ch]">
        <Label className="block">Private appointment</Label>
        <Display size="lg" as="h1" className="mt-4">
          Come and sit with us.
        </Display>
      </div>

      <div className="mt-14 grid gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,560px)_1fr]">
        {/* Form */}
        <div>
          <AppointmentForm timeOptions={s.appointmentSlots} contactPhone={s.phone} />
        </div>

        {/* Obsidian contact + FAQ panel */}
        <aside className="self-start bg-obsidian p-8 text-pearl lg:p-10">
          <Label className="!text-stone-light">
            Where to find us
            <DraftFlag meta={_meta} />
          </Label>
          <address className="mt-4 space-y-0.5 text-[length:var(--text-body-sm)] not-italic">
            <div>{s.address.line1}</div>
            <div>{s.address.line2}</div>
            <div>{s.address.city} {s.address.postalCode}</div>
          </address>
          <ul className="mt-6 space-y-1 text-[length:var(--text-body-sm)]">
            {s.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span className="text-stone-light">{h.open && h.close ? `${h.open}–${h.close}` : (h.label ?? 'Closed')}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-1 text-[length:var(--text-body-sm)]">
            <li><a href={`tel:${s.phone}`} className="hover:text-gold-soft">{prettyPhone(s.phone)}</a></li>
            <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer noopener" className="hover:text-gold-soft">WhatsApp</a></li>
            <li><a href={`mailto:${s.email}`} className="hover:text-gold-soft">{s.email}</a></li>
          </ul>
          <p className="mt-4 text-[length:var(--text-body-sm)] text-stone-light">
            Nearest metro: {s.metro.station} ({s.metro.line}), {s.metro.walkMinutes} min. {s.parking}
          </p>

          {visiting.length > 0 && (
            <>
              <div className="my-8 h-px bg-[var(--color-hairline-inv)]" />
              <Label className="!text-stone-light">Before you come</Label>
              <dl className="mt-4 space-y-4">
                {visiting.map((f) => (
                  <div key={f.question}>
                    <dt className="text-[length:var(--text-body-sm)] text-pearl">{f.question}</dt>
                    <dd className="mt-1 text-[length:var(--text-body-sm)] text-stone-light">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </aside>
      </div>
    </Container>
  )
}
