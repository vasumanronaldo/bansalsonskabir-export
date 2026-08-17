// The house lockup: crest + stacked name, as in the render. Gold crest, serif
// name, spaced-caps subline.
export function Wordmark({ className = '', center = true, onDark = false }: { className?: string; center?: boolean; onDark?: boolean }) {
  return (
    <span className={`inline-flex ${center ? 'flex-col items-center' : 'flex-row items-center gap-3'} leading-none ${onDark ? 'text-pearl' : 'text-charcoal'} ${className}`}>
      <svg viewBox="0 0 100 92" className={`${center ? 'h-7' : 'h-8'} w-auto ${onDark ? 'text-gold-soft' : 'text-gold'}`} fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 8 L58 18 L50 22 L42 18 Z" />
          <path d="M31 26 h38 l-3 30 a16 16 0 0 1 -32 0 Z" />
          <circle cx="50" cy="44" r="7" />
          <path d="M50 37 v14 M43 44 h14" opacity="0.6" />
          <path d="M36 70 h28 M41 77 h18" />
        </g>
      </svg>
      <span className={center ? 'mt-2 flex flex-col items-center' : 'flex flex-col'}>
        <span className="font-[family-name:var(--font-display)] text-[0.95rem] tracking-[0.22em]">BANSAL&nbsp;SONS</span>
        <span className={`mt-0.5 font-[family-name:var(--font-mono)] text-[0.5rem] tracking-[0.42em] ${onDark ? 'text-stone-light' : 'text-stone'}`}>JEWELLERS</span>
      </span>
    </span>
  )
}
