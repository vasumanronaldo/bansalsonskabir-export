// Types + field definitions for settings, shared by the server DB layer and the
// client editor. No server-only imports here, so the client bundle can use it.
export interface Business {
  phone: string
  whatsapp: string
  email: string
  instagram: string
  hoursNote: string
}
export interface Seo {
  title: string
  description: string
}
export interface SettingsForm {
  business: Business
  seo: Record<string, Seo>
}

export const BUSINESS_FIELDS: { name: keyof Business; label: string; help?: string }[] = [
  { name: 'phone', label: 'Phone', help: 'Shown as-is, e.g. +91 98110 00000' },
  { name: 'whatsapp', label: 'WhatsApp number' },
  { name: 'email', label: 'Email' },
  { name: 'instagram', label: 'Instagram handle', help: 'Without the @' },
  { name: 'hoursNote', label: 'Hours note', help: 'A short line shown near the hours' },
]

export const SEO_PAGES: { key: string; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'legacy', label: 'Legacy' },
  { key: 'maison', label: 'Maison' },
  { key: 'craftsmanship', label: 'Craftsmanship' },
  { key: 'appointment', label: 'Appointment' },
]

export const EMPTY_BUSINESS: Business = { phone: '', whatsapp: '', email: '', instagram: '', hoursNote: '' }
