// /contact (docs/04 § Contact). Address, phone, WhatsApp, email, hours,
// Instagram, a static map linking out to Google Maps, GSTIN. No form — it points
// to /appointment. Every fact from the loader.
import type { Metadata } from 'next'
import { getSettings } from '@/lib/client-content'
import { resolvePublicSettings } from '@/lib/admin/settings-db'
import { DraftFlag } from '@/components/DraftFlag'
import { Section } from '@/components/layout/Section'
import { Display, Body, Label } from '@/components/type'
import { ButtonGhost } from '@/components/ui/ButtonGhost'
import { Placeholder } from '@/components/ui/Placeholder'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact & Visit',
  description: 'Bansal Sons Jewellers, C-50 Malviya Nagar, New Delhi. Phone, WhatsApp, hours and directions.',
  ...canonical('/contact'),
}

function prettyPhone(raw: string) {
  const m = raw.match(/^(\+91)(\d{5})(\d{5})$/)
  return m ? `${m[1]} ${m[2]} ${m[3]}` : raw
}

export default async function ContactPage() {
  const { data: file, _meta } = getSettings()
  const s = await resolvePublicSettings(file)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${s.geo.latitude},${s.geo.longitude}`

  return (
    <>
      <Section field="pearl" className="pt-[clamp(3rem,7vw,6rem)]">
        <Label className="block">
          Contact &amp; visit
          <DraftFlag meta={_meta} />
        </Label>
        <Display size="xl" as="h1" className="mt-6">
          Come and see us.
        </Display>
      </Section>

      <Section field="pearl">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <Label size="lg" className="block text-charcoal">Address</Label>
              <address className="mt-3 space-y-0.5 text-[length:var(--text-body-sm)] not-italic text-stone">
                <div>{s.address.line1}</div>
                <div>{s.address.line2}</div>
                <div>{s.address.city} {s.address.postalCode}</div>
              </address>
            </div>
            <div>
              <Label size="lg" className="block text-charcoal">Hours</Label>
              <ul className="mt-3 space-y-1 text-[length:var(--text-body-sm)] text-stone">
                {s.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4">
                    <span>{h.days}</span>
                    <span>{h.open && h.close ? `${h.open}–${h.close}` : (h.label ?? 'Closed')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label size="lg" className="block text-charcoal">Reach us</Label>
              <ul className="mt-3 space-y-1 text-[length:var(--text-body-sm)] text-stone">
                <li><a href={`tel:${s.phone}`} className="hover:text-gold">{prettyPhone(s.phone)}</a></li>
                <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer noopener" className="hover:text-gold">WhatsApp</a></li>
                <li><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>
                <li><a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer noopener" className="hover:text-gold">@{s.instagram}</a></li>
              </ul>
            </div>
            <div>
              <Label size="lg" className="block text-charcoal">Getting here</Label>
              <Body size="sm" muted className="mt-3">
                Nearest metro {s.metro.station} ({s.metro.line}), {s.metro.walkMinutes} min. Landmark: {s.landmark}. {s.parking}
              </Body>
            </div>
            <div className="sm:col-span-2">
              <ButtonGhost href="/appointment">Request a private appointment</ButtonGhost>
              <Body size="sm" muted className="mt-4">Walk-ins are welcome; an appointment means the person who will make your piece is at the table.</Body>
            </div>
          </div>

          {/* Static map → Google Maps (no embedded iframe — docs/03) */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-label="Open in Google Maps"
          >
            <Placeholder ratio="4:5" ground="obsidian" label={`Map — ${s.address.line1}. Opens Google Maps.`} />
          </a>
        </div>
      </Section>
    </>
  )
}
