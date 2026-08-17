// Photography placeholder. Until the family supplies their own photographs, this
// renders real, licence-free demo photography (Unsplash + Pexels) so the site
// reads as a finished shop for a client demo. Deliberately NO identifiable faces
// and NO claim that these are Bansal Sons' own pieces, people or premises — they
// are jewellery / gem / goldsmith-bench / showroom stock, chosen to set mood only
// (CLAUDE.md: no synthetic faces of the family, no passing stock off as their
// inventory). Real photos drop into the same slots and take precedence.

type Ratio = '4:5' | '3:2' | '1:1'
type Ground = 'charcoal' | 'stone' | 'obsidian'

const RATIO: Record<Ratio, string> = {
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
  '1:1': 'aspect-square',
}

// Pools of downloaded demo photos (public/demo/photos).
const JEWEL = [
  'necklace-ruby', 'bracelet-dark', 'earrings-dark', 'ring-halo', 'ring-stone',
  'lockets', 'gold-bar', 'bracelet-rose', 'pearls-box', 'display-velvet',
  'display-box', 'display-necklace', 'bench-pieces',
] as const
const BENCH = [
  'bench-goldhands', 'bench-torch', 'bench-flame', 'bench-heat', 'bench-tools',
  'bench-polish', 'bench-apron', 'bench-solder', 'bench-file',
] as const
const SHOWROOM = ['showroom-1', 'showroom-2', 'showroom-cases', 'showroom-window', 'lounge', 'room'] as const
const EDITORIAL = ['bench-pieces', 'showroom-window', 'display-necklace', 'bench-goldhands', 'lockets'] as const

// Stable hash → non-negative int, so a given seed always maps to the same photo
// (no hydration mismatch, no reshuffle between renders).
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff
  return h
}
function pick<T>(pool: readonly T[], seed: string): T {
  return pool[hash(seed) % pool.length]!
}

// Route a slot to a demo photo from its label/ratio. `seed` varies the choice
// when several slots share the same caption (e.g. the consent-gated bench).
function pickPhoto(label: string, ratio: Ratio, seed: string): string {
  const l = label.toLowerCase()
  // Founder — dignified hands at the bench, never a stranger's face.
  if (/ashok|founder/.test(l)) return 'bench-goldhands'
  // Craftsmanship process steps — labels always read "… — the bench".
  if (/bench/.test(l)) {
    if (/consultation/.test(l)) return 'showroom-window'
    if (/cast/.test(l)) return pick(['bench-flame', 'bench-torch'], seed)
    if (/stone|setting/.test(l)) return 'bench-heat'
    if (/polish/.test(l)) return 'bench-polish'
    if (/quality|inspect/.test(l)) return 'bench-file'
    if (/presentation/.test(l)) return 'display-velvet'
    if (/sketch|cad|forming|design|drawing/.test(l)) return 'bench-tools'
    return pick(BENCH, seed)
  }
  // People at the bench (consent-gated portraits) / craft.
  if (/portrait|people|goldsmith|craftsm|artisan/.test(l)) return pick(BENCH, seed)
  // Showroom / interiors / map / facade.
  if (/showroom|interior|maison|\bvisit|\bstore|\bmap|building|facade/.test(l)) return pick(SHOWROOM, seed)
  // Journal / editorial covers.
  if (/journal|cover/.test(l)) return pick(EDITORIAL, seed)
  // Collection cards — a material-appropriate hero, else a varied piece.
  if (/collection/.test(l)) {
    if (/emerald|gemstone/.test(l)) return 'earrings-emerald'
    if (/ruby/.test(l)) return 'ruby-crystal'
    if (/\bgold\b/.test(l)) return 'gold-bar'
    if (/pearl/.test(l)) return 'pearls-box'
    if (/diamond/.test(l)) return 'ring-halo'
    return pick(JEWEL, seed)
  }
  if (ratio === '3:2') return pick(SHOWROOM, seed)
  // Default: a finished piece (piece cards, dossiers) — varied by seed.
  return pick(JEWEL, seed)
}

export function Placeholder({
  ratio = '4:5',
  ground: _ground = 'charcoal',
  label,
  seed,
  className = '',
}: {
  ratio?: Ratio
  ground?: Ground
  label: string
  /** Overrides the hash source so identical captions can show different photos. */
  seed?: string
  className?: string
}) {
  void _ground
  const photo = pickPhoto(label, ratio, seed ?? label)
  return (
    <div
      role="img"
      aria-label={label}
      className={`group/ph relative overflow-hidden ${RATIO[ratio]} bg-obsidian ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/demo/photos/${photo}.jpg`}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* warm wash to keep the photos on-palette and captions legible */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/10 to-transparent" />
      {/* subtle caption so reviewers still see what belongs in this slot */}
      <span className="absolute bottom-3 left-3 right-3 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-pearl/70">
        {label}
      </span>
    </div>
  )
}
