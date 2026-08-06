# 06 — SEO

Local + branded intent. This is not a content-volume game; do not build a blog
farm. Ten good pages and a correct Google Business Profile beat fifty thin posts.

## Priority keywords

| Tier | Terms |
|---|---|
| Branded (must own) | Bansal Sons Jewellers, Bansal Sons Malviya Nagar, Bansal jewellers Delhi |
| Local high-intent | jewellers in South Delhi, jewellers in Malviya Nagar, bridal jewellery Delhi, engagement rings Delhi, custom jewellery Delhi, jewellery manufacturer Delhi |
| Category | polki jewellery Delhi, kundan jewellery Delhi, jadau jewellery, temple jewellery, natural diamond jewellery Delhi, platinum rings Delhi |
| Informational (Journal) | how to check BIS hallmark, what is HUID, GIA vs IGI certificate, polki vs kundan difference, how making charges are calculated |

Map one primary term per page. Never repeat a primary across two pages.

## Metadata

`generateMetadata` on every route. Title pattern:
`{Page} — Bansal Sons Jewellers` · Home: `Bansal Sons Jewellers — Fine Jewellery & Bespoke Commissions, Malviya Nagar, New Delhi`

Descriptions: 150–160 chars, written, not templated. No keyword stuffing.
OG image: 1200×630, generated per page via `next/og` — Bodoni title on obsidian
with a gold hairline. Consistent, no photography needed.

## Structured data (JSON-LD)

Root layout — `JewelryStore` (a subtype of `LocalBusiness` and `Store`):

```json
{
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "name": "Bansal Sons Jewellers",
  "foundingDate": "1993",
  "founder": { "@type": "Person", "name": "Ashok Kumar Bansal" },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "C-50 Malviya Nagar, Near Laxmi Narayan Mandir",
    "addressLocality": "New Delhi",
    "postalCode": "110017",
    "addressRegion": "Delhi",
    "addressCountry": "IN"
  },
  "telephone": "+918527292840",
  "email": "bansalsonsjewellers18@gmail.com",
  "url": "https://bansalsonsjewellers.com",
  "sameAs": ["https://www.instagram.com/bansalsons_jewellers"],
  "openingHoursSpecification": [ /* from siteSettings */ ],
  "priceRange": "$$$$",
  "geo": { "@type": "GeoCoordinates", "latitude": null, "longitude": null }
}
```
`{/* Fill geo coordinates from the Google Business Profile listing. */}`

Also: `BreadcrumbList` on all nested routes, `Article` on journal posts,
`FAQPage` on `/craftsmanship` if the FAQ block ships there.

**Do not** emit `Product` or `Offer` schema. There are no prices and no
e-commerce; fake Offer markup is a manual-action risk.

## Off-site (do this in week one — it outranks anything on the site)

1. Claim and complete the **Google Business Profile**: category *Jeweler*,
   real interior photos, hours, WhatsApp link, weekly Posts.
2. Consistent **NAP** (name, address, phone) — byte-identical across GBP,
   Instagram bio, JustDial, Sulekha, Facebook, and the site footer.
3. Instagram bio link → homepage, not Linktree.

## Technical

- `sitemap.ts` and `robots.ts` generated from Sanity slugs
- `/studio` and `/kitchen-sink`: `noindex, nofollow`
- Canonical on every page; `www` → apex 301
- `hreflang` not needed (single locale, `en-IN`)
- Images: `next/image`, AVIF/WebP, descriptive `alt` written by hand
  ("Polki choker in 22ct gold, uncut diamonds" — not "jewellery")
