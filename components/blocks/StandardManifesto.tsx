'use client'

// The Bansal Standard (docs/02 § Signature, docs/04 § Home #3) — the one place
// the design raises its voice. Nine lines of display-md Bodoni on obsidian,
// revealed one at a time on scroll at a 90ms stagger, separated by hairlines
// that draw in from the left. A single gold hairline above the block; no other
// ornament, no CTA. Reduced motion collapses to opacity-only.
import { motion, useReducedMotion } from 'framer-motion'
import { ease, dur } from '@/lib/motion'
import { Container } from '@/components/layout/Container'

// Verbatim, nine lines (docs/01-brand.md § The Bansal Standard).
const LINES = [
  'We welcome before we sell.',
  'We educate before we recommend.',
  'We listen before we design.',
  'We build trust before jewellery.',
  'We create relationships before transactions.',
  'We never compromise on quality.',
] as const

export default function StandardManifesto() {
  const reduced = useReducedMotion()

  const line = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: dur.fast, ease } } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: dur.base, ease } } }

  const rule = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: dur.base, ease } } }

  return (
    <section aria-label="The Bansal Standard" className="bg-obsidian py-[var(--spacing-rhythm)] text-pearl">
      <Container>
        {/* the single permitted gold element */}
        <div className="mb-10 h-px w-full origin-left bg-gold" />
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.09 }}
        >
          {LINES.map((text, i) => (
            <li key={text}>
              {i > 0 && (
                <motion.div
                  variants={rule}
                  className="h-px w-full origin-left bg-[var(--color-hairline-inv)]"
                />
              )}
              <motion.p
                variants={line}
                className="font-[family-name:var(--font-display)] text-[length:var(--text-display-md)] leading-[1.15] py-7"
              >
                {text}
              </motion.p>
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
