// Typefaces (docs/02-design-system.md § Typography).
// Swap the two display/body constants to licence a true Didone (Canela,
// Domaine Display, Genath) + grotesque (Söhne, Suisse Int'l) later. Do not
// attempt without a licence.

import { Bodoni_Moda, Archivo, IBM_Plex_Mono } from 'next/font/google'

// Display — Didone, per the brief's "Didot". Optical sizing on; weight 400/500.
export const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  preload: true,
})

// Body — neutral grotesque.
export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-archivo',
  preload: true,
})

// Utility — mono for labels, reference numbers, spec rows. Not preloaded.
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  preload: false,
})

/** Class list for the <html> element — exposes the three font CSS variables. */
export const fontVariables = `${bodoni.variable} ${archivo.variable} ${plexMono.variable}`
