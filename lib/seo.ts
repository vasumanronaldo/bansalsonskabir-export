// SEO helpers (docs/06). JSON-LD built from the content loader — never
// hardcoded. No Product/Offer schema is ever emitted (there are no prices).
import type { Settings } from './client-content'

const site = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://bansalsonsjewellers.com'

const DAY_MAP: Record<string, string[]> = {
  'Wednesday – Monday': ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'],
  Tuesday: ['Tuesday'],
}

/** JewelryStore (a LocalBusiness + Store subtype) for the root layout. */
export function jewelryStoreJsonLd(s: Settings) {
  const openingHours = s.hours
    .filter((h) => h.open && h.close)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_MAP[h.days] ?? [h.days],
      opens: h.open,
      closes: h.close,
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: s.legalName,
    foundingDate: String(s.foundedYear),
    founder: { '@type': 'Person', name: s.founder.replace(/^Shri\s+/, '') },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${s.address.line1}, ${s.address.line2}`,
      addressLocality: s.address.city,
      postalCode: s.address.postalCode,
      addressRegion: s.address.region,
      addressCountry: s.address.country,
    },
    telephone: s.phone,
    email: s.email,
    url: site(),
    sameAs: [`https://www.instagram.com/${s.instagram}`],
    openingHoursSpecification: openingHours,
    priceRange: '$$$$',
    geo: { '@type': 'GeoCoordinates', latitude: s.geo.latitude, longitude: s.geo.longitude },
  }
}

/** BreadcrumbList for nested routes. */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${site()}${t.path}`,
    })),
  }
}

/** Canonical URL for a path, relative to the site origin. */
export function canonical(path: string) {
  return { alternates: { canonical: path } }
}
