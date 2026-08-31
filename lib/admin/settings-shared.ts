// Types + field definitions for settings, shared by the server DB layer and the
// client editor. No server-only imports here, so the client bundle can use it.
export interface Business {
  phone: string
  whatsapp: string
  email: string
  instagram: string
  hoursNote: string
  addrLine1: string
  addrLine2: string
  addrCity: string
  addrPostal: string
  hoursJson: string
}
export interface Seo {
  title: string
  description: string
}
export interface SettingsForm {
  business: Business
  seo: Record<string, Seo>
}

export const BUSINESS_FIELDS: { name: keyof Business; label: string; help?: string; multiline?: boolean }[] = [
  { name: 'phone', label: 'Phone', help: 'Shown as-is, e.g. +91 98110 00000' },
  { name: 'whatsapp', label: 'WhatsApp number' },
  { name: 'email', label: 'Email' },
  { name: 'instagram', label: 'Instagram handle', help: 'Without the @' },
  { name: 'addrLine1', label: 'Address line 1', help: 'e.g. C-50 Malviya Nagar' },
  { name: 'addrLine2', label: 'Address line 2', help: 'e.g. Near Laxmi Narayan Mandir' },
  { name: 'addrCity', label: 'City' },
  { name: 'addrPostal', label: 'Postal code' },
  { name: 'hoursNote', label: 'Hours note', help: 'A short line shown near the hours' },
  {
    name: 'hoursJson',
    label: 'Opening hours',
    multiline: true,
    help: 'JSON list. Each item: {"days":"Wed – Mon","open":"11:00","close":"20:00"} or {"days":"Tuesday","label":"Closed"}. Leave blank to use the committed hours.',
  },
]

export const SEO_PAGES: { key: string; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'legacy', label: 'Legacy' },
  { key: 'maison', label: 'Maison' },
  { key: 'craftsmanship', label: 'Craftsmanship' },
  { key: 'appointment', label: 'Appointment' },
]

export const EMPTY_BUSINESS: Business = {
  phone: '',
  whatsapp: '',
  email: '',
  instagram: '',
  hoursNote: '',
  addrLine1: '',
  addrLine2: '',
  addrCity: '',
  addrPostal: '',
  hoursJson: '',
}
