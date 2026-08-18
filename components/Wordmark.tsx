// The house lockup: the client's BsJ monogram + the stacked name. The monogram
// is the supplied logo, background removed to a transparent PNG so its gold works
// on both the pearl header and the obsidian footer.
export function Wordmark({ className = '', center = true, onDark = false }: { className?: string; center?: boolean; onDark?: boolean }) {
  return (
    <span className={`inline-flex ${center ? 'flex-col items-center' : 'flex-row items-center gap-3'} leading-none ${onDark ? 'text-pearl' : 'text-charcoal'} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/brand/logo-bsj-monogram.png"
        alt="Bansal Sons Jewellers"
        className={`${center ? 'h-11' : 'h-12'} w-auto`}
      />
      <span className={center ? 'mt-2 flex flex-col items-center' : 'flex flex-col'}>
        <span className="font-[family-name:var(--font-display)] text-[0.95rem] tracking-[0.22em]">BANSAL&nbsp;SONS</span>
        <span className={`mt-0.5 font-[family-name:var(--font-mono)] text-[0.5rem] tracking-[0.42em] ${onDark ? 'text-stone-light' : 'text-stone'}`}>JEWELLERS</span>
      </span>
    </span>
  )
}
