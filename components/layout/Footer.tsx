// Footer (docs/02): obsidian feature ground — contact block, hours, GST/BIS
// marks. Every fact comes from the content loader; nothing is hardcoded. Carries
// a dev-only DraftFlag because settings are still unapproved.
import { getSettings } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Label } from '@/components/type/Label'
import { Wordmark } from '@/components/Wordmark'

// "+918527292840" → "+91 85272 92840" for display; tel: uses the raw value.
function prettyPhone(raw: string): string {
  const m = raw.match(/^(\+91)(\d{5})(\d{5})$/)
  return m ? `${m[1]} ${m[2]} ${m[3]}` : raw
}

export function Footer() {
  const { data: s, _meta } = getSettings()
  const addr = s.address

  return (
    <footer className="bg-obsidian text-pearl">
      <div className="mx-auto grid max-w-[1240px] gap-x-8 gap-y-12 px-[var(--spacing-gutter)] py-[clamp(3.5rem,7vw,6rem)] md:grid-cols-2 lg:grid-cols-4">
        {/* Wordmark + line */}
        <div className="lg:col-span-1">
          <Wordmark center={false} onDark />
          <DraftFlag meta={_meta} />
          <p className="mt-4 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-stone-light">
            Made by us since {s.foundedYear}.
          </p>
        </div>

        {/* Visit */}
        <div>
          <Label className="!text-stone-light">Visit</Label>
          <address className="mt-4 space-y-1 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] not-italic text-pearl">
            <div>{addr.line1}</div>
            <div>{addr.line2}</div>
            <div>
              {addr.city} {addr.postalCode}
            </div>
            <div className="pt-3 text-stone-light">
              Nearest metro: {s.metro.station} ({s.metro.line}), {s.metro.walkMinutes} min
            </div>
          </address>
        </div>

        {/* Contact */}
        <div>
          <Label className="!text-stone-light">Contact</Label>
          <ul className="mt-4 space-y-1 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)]">
            <li>
              <a href={`tel:${s.phone}`} className="hover:text-gold-soft">
                {prettyPhone(s.phone)}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer noopener" className="hover:text-gold-soft">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="hover:text-gold-soft">
                {s.email}
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer noopener" className="hover:text-gold-soft">
                @{s.instagram}
              </a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <Label className="!text-stone-light">Hours</Label>
          <ul className="mt-4 space-y-1 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)]">
            {s.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span className="text-stone-light">
                  {h.open && h.close ? `${h.open}–${h.close}` : (h.label ?? 'Closed')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Marks */}
      <div className="border-t border-[var(--color-hairline-inv)]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-[var(--spacing-gutter)] py-6 font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-stone-light md:flex-row md:items-center md:justify-between">
          <span>{s.certifications.join(' · ')}</span>
          <span className="text-stone">
            © {s.foundedYear}—present {s.legalName}
          </span>
        </div>
      </div>
    </footer>
  )
}
