import type { MetadataRoute } from 'next'

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://bansalsonsjewellers.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/kitchen-sink', '/api/'],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
