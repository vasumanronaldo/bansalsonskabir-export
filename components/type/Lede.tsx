// Lede — the opening paragraph. body-lg Archivo, measured (docs/02 § Type scale).
import type { ReactNode } from 'react'
import { Body } from './Body'

export function Lede({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <Body size="lg" className={className}>
      {children}
    </Body>
  )
}
