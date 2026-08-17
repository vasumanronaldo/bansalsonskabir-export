# 03 — Architecture

> **Superseded in part.** The live build runs on **Cloudflare Workers**, and
> content is managed by a **self-hosted admin portal on D1 and R2** — not Sanity,
> not Vercel. Where this document and `docs/10-admin-portal.md` disagree about
> hosting, database or CMS, that file wins. Everything here about routes,
> rendering, performance budget and `content/client/` still applies.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Journal + newsletter + admin need a server; static export for everything else |
| Language | TypeScript, `strict: true` | — |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | Tokens live in CSS, not a JS config |
| Motion | Framer Motion 11 | Lazy-loaded per section via `dynamic()` |
| CMS | **Sanity v3**, Studio embedded at `/studio` | Non-technical staff; image hotspot/crop + CDN transforms matter for jewellery |
| Email | **Resend** + React Email | Appointment confirmation + internal notification |
| Newsletter | Resend Audiences (or Buttondown) | No Mailchimp — the branding is unavoidable |
| Hosting | **Vercel** | ISR + route handlers; Cloudflare Pages fights Next.js |
| Analytics | Vercel Analytics + Speed Insights | Cookieless, no consent banner needed |
| Maps | Static map image + link out | An embedded iframe costs ~300kb and leaks to Google |

**Do not add:** a UI kit, a component library, an animation library beyond Framer,
a state manager, or an ORM. Ask first.

---

## Routes

```
/                       Home
/legacy                 Our Legacy — founder, timeline, manifesto
/maison                 The Maison — showroom, hospitality, visiting
/craftsmanship          Craftsmanship — process sequence, certification, transparency
/collections            Collections — index of categories
/collections/[slug]     A collection (lookbook, no prices)
/collections/[slug]/[piece]  The maker's dossier for one piece — see below
/bespoke                Bespoke Atelier — commission journey
/journal                Journal — index, paginated
/journal/[slug]         Article
/appointment            Private Appointment — the primary conversion
/contact                Contact — address, hours, WhatsApp, static map
/privacy                Privacy policy
/studio/[[...tool]]     Sanity Studio (noindex)
not-found.tsx           404
```

**Route handlers**
```
POST /api/appointment   Zod validate → Resend (client confirm + internal notify)
                        → Sanity `appointmentRequest` doc. Rate limit 5/hr/IP.
POST /api/newsletter    Zod validate → Resend Audience. Double opt-in.
```

Both use a honeypot field + a timing check. **No CAPTCHA** — it reads cheap.

---

## Rendering

- All content pages: static, revalidated via Sanity webhook → `revalidateTag`
- `generateStaticParams` for `/collections/[slug]`,
  `/collections/[slug]/[piece]` and `/journal/[slug]`
- `/appointment` and `/contact` are static; only the form POST is dynamic
- `/studio` is `dynamic = 'force-dynamic'` and `robots: noindex`

---

## Sanity schema

Group fields into tabs and write **plain-language labels and descriptions** —
the staff using this are jewellers, not developers.

```ts
// documents
siteSettings   singleton  phone, whatsapp, email, address, hours[],
                          instagram, gstin, mapImage, defaultOgImage

collection     title, slug, order, shortDescription, heroImage,
                          introText (portable text), pieces[] → piece

piece          reference (string, e.g. "BSJ-0417"), title, slug,
                          collection → collection, images[] (hotspot),
                          category (enum: bridal|diamond|polki|kundan|jadau|
                            temple|platinum|gold|gemstone|mens|everyday),
                          status (enum: archive|sold|inWorkshop|available)
                          description (portable text), isBespoke (bool),
                          featured (bool), consentOnFile (bool), publishedAt,

                          // THE MAKER'S DOSSIER — the site's differentiator.
                          // See docs/07-references.md § D1. Every field optional
                          // at the record level; the page renders only what exists.
                          dossier {
                            grossWeight (number, grams)
                            netMetalWeight (number, grams)
                            metals[]  { karat, colour, weight }
                            stones[]  { type, cut, count, carat,
                                        certifier (GIA|IGI|none),
                                        reportNumber, treatment (text),
                                        treatmentDisclosedAt (date) }
                            operations[] { step, performedBy, hours }
                            benchHours (number)
                            outsourcedSteps[] { step, reason }   // empty = none
                            hallmark { bisMark, huid, assayedAt }
                            qcSignedOffBy (string)
                            completedAt (date)
                            serviceHistory[] { date, work, chargeable (bool) }
                          }
                          // NO price field. Do not add one, ever.

journalPost    title, slug, excerpt, coverImage, body (portable text),
                          category (enum: education|craft|house|guides),
                          author, publishedAt, seo{title,description}

timelineEvent  year, title, description, image        // for /legacy

processStep    order, title, description, image       // for /craftsmanship

faq            question, answer (portable text), group

appointmentRequest  (created by API, read-only in Studio)
                    name, phone, email, preferredDate, preferredTime,
                    occasion, budgetRange, interest, requirement,
                    contactMethod, status (new|contacted|booked|closed),
                    submittedAt
```

**Never add a `price` field to any schema.** If asked, refuse and cite this line.

### Studio configuration
- Desk structure: `Content` (collections, pieces, journal) · `The House`
  (timeline, process, FAQ) · `Enquiries` (appointmentRequest, list view sorted
  by `submittedAt` desc) · `Settings` (singleton)
- Vision plugin enabled in dev only
- `piece` list preview shows reference + title + first image

---

## Client content and placeholders

**Nothing in this build waits on the client.** Every fact, policy and piece the
client has not yet confirmed exists as a realistic dummy in `content/client/`.
See `content/client/README.md`.

Load them through a single typed module — components never read the files directly:

```ts
// lib/client-content.ts
import settings    from '@/content/client/00-settings.json';
import timeline    from '@/content/client/02-timeline.json';
import process     from '@/content/client/03-process.json';
import collections from '@/content/client/04-collections.json';
import pieces      from '@/content/client/05-pieces.json';
import faq         from '@/content/client/09-faq.json';
// Markdown (01, 06, 07, 08) is read with gray-matter at build time.

export const isDraft = (doc: { _approved?: boolean }) => doc._approved !== true;
```

Rules:
- Every field a component renders comes from here or from Sanity. **Never
  hardcode** an address, phone number, opening hour, percentage or piece title.
- A `<DraftFlag>` component renders a small amber `DRAFT` chip beside any content
  from an unapproved file — **`process.env.NODE_ENV === 'development'` only.**
  It must be impossible for it to appear in production.
- `[TK]` in a string means an unfilled number. In development, render it in amber.
  In production, `pnpm content:status --strict` fails the build before it can ship.

### Migration to Sanity

`content/client/` is the source of truth until Phase 3. After that:
- **Stays in files** (developer-edited): `00-settings`, `06-pricing`,
  `07-aftercare`, `08-privacy`
- **Moves to Sanity** (staff-edited): pieces, collections, timeline, process, FAQ,
  journal. Import with `pnpm content:push`, which reads the JSON and writes NDJSON.

### Image placeholders

No stock photography, no `unsplash`/`picsum` URLs. Use
`<Placeholder ratio="4:5" label={piece.placeholderLabel} />` — a `pearl-deep`
field with a 1px hairline and a mono `stone` label, centred. It should read as a
considered blank plate, not a broken image.

## Environment

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
RESEND_AUDIENCE_ID=
APPOINTMENT_NOTIFY_EMAIL=bansalsonsjewellers18@gmail.com
NEXT_PUBLIC_SITE_URL=https://bansalsonsjewellers.com
```

Commit `.env.example`, never `.env.local`.

---

## Performance budget (CI-enforced)

| Metric | Budget |
|---|---|
| Homepage JS (gzipped) | < 120 kb |
| LCP (4G, mid-range Android) | < 2.0 s |
| CLS | < 0.05 |
| Lighthouse Perf / A11y / SEO | ≥ 95 / 100 / 100 |

Framer Motion is imported via `dynamic(() => import(...), { ssr: false })` at the
**section** level, never in the root layout. Fonts are self-hosted by `next/font`.
No third-party script loads before user interaction.
