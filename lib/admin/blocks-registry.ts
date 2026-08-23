// Registry of editable page-copy blocks (docs/11 § 1). Each block's `default` is
// the committed copy — the fallback when no row exists, and the target of
// "reset to default". Plain module so the seed script, the editor and the pages
// share one source. Extend page by page; the mechanism is identical for each.
export interface BlockDef {
  page: string
  label: string
  default: string
}

export const BLOCKS: Record<string, BlockDef> = {
  'home.hero.headline': { page: 'home', label: 'Hero — headline', default: 'Before there is jewellery, there is trust.' },
  'home.hero.lede': { page: 'home', label: 'Hero — lede', default: 'A heritage jewellery outlet in South Delhi, in its third generation. Every piece we sell, we have made. Every stone we set, we can account for.' },

  'home.proof.1.heading': { page: 'home', label: 'Proof 1 — heading', default: 'Made in our own workshops' },
  'home.proof.1.body': { page: 'home', label: 'Proof 1 — body', default: 'Nothing is bought in and rebranded. Design, casting, setting, polishing and finishing all happen in our own workshops.' },
  'home.proof.2.heading': { page: 'home', label: 'Proof 2 — heading', default: 'Natural diamonds only' },
  'home.proof.2.body': { page: 'home', label: 'Proof 2 — body', default: 'GIA and IGI certified. Every gold piece BIS hallmarked and HUID registered. Lab-grown stones are not sold here.' },
  'home.proof.3.heading': { page: 'home', label: 'Proof 3 — heading', default: 'One family, one address' },
  'home.proof.3.body': { page: 'home', label: 'Proof 3 — body', default: 'Founded in 1993 by Shri Ashok Kumar Bansal. Run today by his sons.' },
  'home.proof.4.heading': { page: 'home', label: 'Proof 4 — heading', default: 'Billed in front of you' },
  'home.proof.4.body': { page: 'home', label: 'Proof 4 — body', default: 'Weighing, billing and packing are done at your table. You are told how the price is built before you decide.' },
  'home.proof.5.heading': { page: 'home', label: 'Proof 5 — heading', default: 'Serviced for life' },
  'home.proof.5.body': { page: 'home', label: 'Proof 5 — body', default: 'Cleaning, polishing, resizing and repair, at no charge, for anything we have made.' },

  'home.standard.1': { page: 'home', label: 'The Bansal Standard — line 1', default: 'We welcome before we sell.' },
  'home.standard.2': { page: 'home', label: 'The Bansal Standard — line 2', default: 'We educate before we recommend.' },
  'home.standard.3': { page: 'home', label: 'The Bansal Standard — line 3', default: 'We listen before we design.' },
  'home.standard.4': { page: 'home', label: 'The Bansal Standard — line 4', default: 'We build trust before jewellery.' },
  'home.standard.5': { page: 'home', label: 'The Bansal Standard — line 5', default: 'We create relationships before transactions.' },
  'home.standard.6': { page: 'home', label: 'The Bansal Standard — line 6', default: 'We never compromise on quality.' },
}

export const BLOCK_PAGES = Array.from(new Set(Object.values(BLOCKS).map((b) => b.page)))
