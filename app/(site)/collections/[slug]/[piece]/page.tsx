// /collections/[slug]/[piece] — THE MAKER'S DOSSIER (docs/04 § dossier).
// The single most differentiating page on the site. Images left (sticky),
// record right. Render ONLY fields that exist — never an empty row or "N/A".
// No enquiry action, no price, no "similar pieces", no client names.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPieces } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Container } from '@/components/layout/Container'
import { Display, Body, Label } from '@/components/type'
import { Placeholder } from '@/components/ui/Placeholder'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { DossierRecord, type DossierRow } from '@/components/blocks/DossierRecord'
import { pieceDossier, allPieceParams, type NormalizedDossier } from '@/lib/collections'

export async function generateStaticParams() {
  return allPieceParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; piece: string }> }): Promise<Metadata> {
  const { slug, piece } = await params
  const d = await pieceDossier(slug, piece)
  if (!d) return {}
  return { title: `${d.title} · ${d.reference}`, description: `${d.title} — the maker's dossier. ${d.reference}, made by Bansal Sons.` }
}

function buildGroups(d: NormalizedDossier): DossierRow[][] {
  const groups: DossierRow[][] = []
  const push = (rows: (DossierRow | null)[]) => {
    const kept = rows.filter((r): r is DossierRow => !!r && r.lines.length > 0)
    if (kept.length) groups.push(kept)
  }
  const row = (label: string, ...lines: (string | undefined)[]): DossierRow | null => {
    const kept = lines.filter((l): l is string => !!l && l.trim().length > 0)
    return kept.length ? { label, lines: kept } : null
  }

  // identity
  push([
    row('Reference', d.reference),
    row('Completed', d.completed),
    row('Status', d.status),
  ])

  // metal
  push([
    row('Metal', d.metal),
    row('Gross weight', d.grossWeight != null ? `${d.grossWeight} g` : undefined),
    row('Net metal weight', d.netMetalWeight != null ? `${d.netMetalWeight} g` : undefined),
  ])

  // stones — multi-line
  if (d.stones && d.stones.length) {
    const lines: string[] = []
    for (const s of d.stones) {
      const treatment = s.treatment && s.treatment !== '[TK]' ? s.treatment : null
      const head = [s.type, s.count != null ? `× ${s.count}` : null, s.carat != null ? `${s.carat} ct total` : null, treatment].filter(Boolean).join(' · ')
      if (head) lines.push(head)
      // Omit an unfilled ([TK]) report number — never render a placeholder here.
      const report = s.reportNumber && s.reportNumber !== '[TK]' ? s.reportNumber : null
      const cert = [s.certifier && s.certifier !== 'none' ? s.certifier : null, report ? `report ${report}` : null].filter(Boolean).join(' ')
      if (cert) lines.push(cert)
    }
    if (lines.length) push([{ label: 'Stones', lines }])
  }

  // bench
  push([
    row('Made at the bench', d.operations?.length ? d.operations.join(' · ') : undefined),
    // "None" is a claim we make explicitly when the data confirms it (docs § dossier)
    row('Outsourced', d.outsourced ? (d.outsourced.length ? d.outsourced.join(' · ') : 'None') : undefined),
    row('Bench hours', d.benchHours != null ? String(d.benchHours) : undefined),
  ])

  // hallmark
  const hallmark = d.hallmark ? [d.hallmark.bisMark, d.hallmark.huid ? `HUID ${d.hallmark.huid}` : null].filter(Boolean).join(' · ') : undefined
  const checkedBy = d.checkedBy ? [d.checkedBy, d.completed].filter(Boolean).join(', ') : undefined
  push([row('Hallmark', hallmark || undefined), row('Checked by', checkedBy)])

  // service
  if (d.serviceHistory && d.serviceHistory.length) {
    const lines = d.serviceHistory.map((s) => [s.date, s.work, s.chargeable != null ? (s.chargeable ? 'chargeable' : 'no charge') : null].filter(Boolean).join(' · '))
    push([{ label: 'Serviced', lines }])
  }

  return groups
}

export default async function DossierPage({ params }: { params: Promise<{ slug: string; piece: string }> }) {
  const { slug, piece } = await params
  const d = await pieceDossier(slug, piece)
  if (!d) notFound()
  const { _meta } = getPieces()
  const groups = buildGroups(d)

  return (
    <Container className="py-[clamp(2.5rem,6vw,5rem)]">
      <LinkArrow href={`/collections/${d.collectionSlug}`}>Back to the collection</LinkArrow>

      <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
        {/* Images — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Placeholder ratio="4:5" ground="charcoal" label={d.placeholderLabel || `${d.title} — ${d.reference}`} />
        </div>

        {/* The record */}
        <div>
          <Label className="block">
            The maker&rsquo;s dossier
            <DraftFlag meta={_meta} />
          </Label>
          <Display size="lg" as="h1" className="mt-3">
            {d.title}
          </Display>
          {d.isBespoke && <Label className="mt-3 block">Made as a commission</Label>}

          <div className="mt-10">
            <DossierRecord groups={groups} />
          </div>

          {d.description && (
            <Body className="mt-10 max-w-[52ch] text-stone">{d.description}</Body>
          )}
        </div>
      </div>
    </Container>
  )
}
