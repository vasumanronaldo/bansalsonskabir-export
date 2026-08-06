'use client'

// Dev-only demo of the entrance motion + reduced-motion collapse (lib/motion.ts).
import { motion } from 'framer-motion'
import { useEntrance, stagger } from '@/lib/motion'
import { Body } from '@/components/type'

export function MotionSample() {
  const entrance = useEntrance('rise')
  return (
    <motion.ul
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="space-y-2"
    >
      {['Drawn', 'Cast', 'Set', 'Finished'].map((word) => (
        <motion.li key={word} variants={entrance.variants}>
          <Body as="span">{word} — rises 16px, once, expo-out (opacity-only under reduced motion).</Body>
        </motion.li>
      ))}
    </motion.ul>
  )
}
