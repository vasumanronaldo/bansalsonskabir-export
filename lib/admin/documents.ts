// Registry of the long-form, editable page prose (the essays and policies that
// live in content/client/*.md). Each document's committed body is the seed and
// the "reset" target. Server-safe (no 'server-only') so both the admin seeder and
// the public resolver can share it; the client editor never imports this.
import { getFounder, getVisit, getPricing, getAftercare, getCommissionTerms, getPrivacy } from '@/lib/client-content'

export interface DocDef {
  key: string
  label: string
  page: string
  /** Committed body from the markdown file (frontmatter stripped). */
  body: () => string
}

export const DOCUMENTS: DocDef[] = [
  { key: 'founder', label: 'Legacy — the founder story', page: 'legacy', body: () => getFounder().body },
  { key: 'visit', label: 'Maison — what a visit is like', page: 'maison', body: () => getVisit().body },
  { key: 'pricing', label: 'Craftsmanship — how a price is built', page: 'craftsmanship', body: () => getPricing().body },
  { key: 'aftercare', label: 'Craftsmanship — aftercare, buyback & exchange', page: 'craftsmanship', body: () => getAftercare().body },
  { key: 'commission-terms', label: 'Bespoke — commission terms', page: 'bespoke', body: () => getCommissionTerms().body },
  { key: 'privacy', label: 'Privacy — the full policy', page: 'privacy', body: () => getPrivacy().body },
]

export const DOC_BY_KEY: Record<string, DocDef> = Object.fromEntries(DOCUMENTS.map((d) => [d.key, d]))
