// The 1px rule that separates sections and carries the gold accent when asked
// (docs/02 § Layout). Depth comes from tone, not shadow. On dark fields pass
// `inverse`; for the rare gold accent pass `tone="gold"` (counts toward the
// ≤3 gold-elements-per-viewport cap).
type Tone = 'default' | 'inverse' | 'gold'

const TONE: Record<Tone, string> = {
  default: 'bg-[var(--color-hairline)]',
  inverse: 'bg-[var(--color-hairline-inv)]',
  gold: 'bg-gold',
}

export function Hairline({
  tone = 'default',
  className = '',
}: {
  tone?: Tone
  className?: string
}) {
  return <hr aria-hidden="true" className={`h-px w-full border-0 ${TONE[tone]} ${className}`} />
}
