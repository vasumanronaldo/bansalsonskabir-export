// Motion primitives (docs/02 § Motion). Elegant, slow, purposeful. Nothing
// bounces, nothing springs. Every variant must be consumed through a
// useReducedMotion() check that collapses to opacity-only — see useEntrance().

import { useReducedMotion, type Variants } from 'framer-motion'

export const ease = [0.22, 1, 0.36, 1] as const // expo-out
export const dur = { fast: 0.4, base: 0.7, slow: 1.1 } as const

/** Fade + 16px rise on scroll entry. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
}

/** Reduced-motion equivalent: opacity only, no translate. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.fast, ease } },
}

/** Stagger container for children entering at 60–90ms. */
export const stagger = (staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren } },
})

/** Image reveal: scale 1.04 → 1.0 over 1.1s with an opacity fade. */
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  show: { opacity: 1, scale: 1, transition: { duration: dur.slow, ease } },
}

/** Hairline drawing left → right on section entry. */
export const hairlineDraw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: dur.base, ease } },
}

/** Standard viewport trigger: once, quarter visible. */
export const inView = { once: true, amount: 0.25 } as const

/**
 * The one entrance hook every animated block should use. Honours
 * prefers-reduced-motion by collapsing rise/scale to opacity-only.
 */
export function useEntrance(kind: 'rise' | 'image' = 'rise') {
  const reduced = useReducedMotion()
  const variants = reduced ? fadeOnly : kind === 'image' ? imageReveal : riseIn
  return { variants, initial: 'hidden' as const, whileInView: 'show' as const, viewport: inView }
}
