# Bansal Sons Jewellers — Project Context

**Read this file only. Do NOT read all of `/docs` at once.**
Open the one doc that matches your current task, then stop.

| If the task is about… | Read only |
|---|---|
| Voice, copy, facts, what we claim | `docs/01-brand.md` |
| Colour, type, spacing, motion, components | `docs/02-design-system.md` |
| Routes, stack, CMS schema, integrations | `docs/03-architecture.md` |
| A specific page's sections + copy | `docs/04-pages.md` |
| What to build next, in order | `docs/05-build-order.md` |
| Unconfirmed client facts, policy, dummy data | `content/client/README.md` |

`docs/07-references.md` and `docs/08-mockup-review.md` are **deliberately not in
this table.** It is a competitor
audit — background evidence, not instruction. Read it only when explicitly told
to, and never during a build phase. If it ever contradicts `docs/02-design-system.md`
or `docs/04-pages.md`, the spec wins; log the conflict, do not resolve it.
| SEO, schema.org, metadata | `docs/06-seo.md` |

---

## What this is

A brochure site for a family jewellery maison in South Delhi. Appointment-first,
**no e-commerce, no prices, no cart, ever.** The site's job is to earn trust
*before* it shows product, and convert that trust into a private appointment booking.

## Stack (fixed — do not substitute)

Next.js 15 App Router · TypeScript (strict) · Tailwind CSS v4 · Framer Motion ·
Sanity v3 (CMS, embedded Studio at `/studio`) · Resend (transactional email) ·
Vercel (hosting) · Vercel Analytics

## Hard facts — never invent or alter these

- Founded **1993** by Shri Ashok Kumar Bansal
- Current leadership: **Chetan Bansal, Karan Bansal, Rajeev Bansal**
- C-50 Malviya Nagar, Near Laxmi Narayan Mandir, New Delhi 110017
- +91 85272 92840 (phone + WhatsApp) · bansalsonsjewellers18@gmail.com
- Instagram: @bansalsons_jewellers
- **Never write "35 years" or "35+ years."** 1993→2026 is 33 years.
  Correct forms: "Since 1993", "over three decades", "three generations".
- Legal/structural name: **Bansal Sons Jewellers**.
  "The House of Bansal" is editorial prose only — never in the logo, nav,
  `<title>`, schema.org, or contact details.

## Absolute prohibitions

- No prices, no "Buy", "Shop", "Add to cart", "Sale", "Offer", "Discount", "Deal"
- No popups, no exit-intent modals, no countdown timers, no chat widgets
- No stock photography of jewellery or people. Use placeholders until real
  photography is supplied; see `docs/03-architecture.md` § Placeholders
- No gold gradients, no shimmer/sparkle animations, no gold background fills.
  Gold is an accent used at hairline weight only
- No fake testimonials, no invented client names, no invented awards
- **No AI-generated or stock photography of people, ever** — not the family, not
  the craftsmen, not clients. Synthetic faces on a site arguing for this family's
  honesty is disqualifying. Use `<Placeholder>` until real photographs exist
- Never take a fact from a mockup or a reference image. Facts come only from
  `content/client/` via `lib/client-content.ts`. The August 2026 mockup contains
  a wrong founder name, wrong address, wrong phone and wrong email
- Never let a `DRAFT` marker or a `[TK]` value render in a production build
- No client faces or names anywhere without an explicit `consentOnFile` flag

## Working rules

1. **One phase at a time.** Follow `docs/05-build-order.md`. Do not scaffold
   ahead of the current phase.
2. **Check before creating.** `ls` the target directory before writing a file.
   Never overwrite without reading first.
3. **Nothing is ever blocked on the client.** Every unconfirmed fact already has
   a realistic dummy in `content/client/`. Read from those files — never hardcode
   an address, an hour, a percentage or a piece description into a component.
   Do not invent new placeholders; if a fact is missing, add it to the relevant
   file in `content/client/` with a `[TK]` marker and list it under `_needs`.
4. **Static by default.** Every page is statically generated. Only the
   appointment form and newsletter signup are dynamic (route handlers).
5. **Performance budget:** LCP < 2.0s on 4G, CLS < 0.05, total JS < 120kb gzipped
   on the homepage. Framer Motion is lazy-loaded per section, not global.
6. **Accessibility floor:** WCAG 2.1 AA. Visible focus rings, `prefers-reduced-motion`
   respected everywhere, all interactive elements keyboard-reachable.
7. Ask before adding any dependency not listed in the stack above.

## Voice, in one line

Quiet, specific, factual. A jeweller explaining something across a table —
not a brand talking at you. Never superlative, never salesy, never breathless.
