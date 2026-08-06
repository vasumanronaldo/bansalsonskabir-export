# 05 — Build Order

**Nine phases. Do exactly one per session.** Commit at the end of each, run
`/qa`, then stop and report. Do not begin the next phase without being asked.

Mark progress here by changing `[ ]` to `[x]` as you finish.

---

## [x] Phase 1 — Foundation
Scaffold Next.js 15 + TS strict + Tailwind v4. Wire `lib/client-content.ts`,
the `DraftFlag` component and the `content:status` / `content:edit` scripts first —
every later phase depends on them. Colour and type tokens from
`docs/02-design-system.md` into `app/globals.css`. `lib/fonts.ts`. Root layout,
`Container`, `Section`, `Hairline`. `.env.example`. `.gitignore`.
Prettier + ESLint. **No pages yet.**
*Read: `02-design-system.md` only.*

## [x] Phase 2 — Design primitives
`type/` (Display, Lede, Body, Label), `ui/` (LinkArrow, ButtonGhost, Placeholder),
`layout/Header`, `layout/Footer`. Motion primitives in `lib/motion.ts` with the
`useReducedMotion` wrapper. Build a `/kitchen-sink` dev-only route rendering every
primitive at every size. **Screenshot it and critique your own work before moving on.**
*Read: `02-design-system.md` only.*

## [ ] Phase 3 — Sanity
Install Sanity v3, embed Studio at `/studio`. All schemas from
`docs/03-architecture.md`. Desk structure, plain-language labels. GROQ queries in
`sanity/queries.ts` with typed returns. Write `pnpm content:push` to import
`content/client/{02,03,04,05,09}` into Sanity as NDJSON, preserving `_approved`.
*Read: `03-architecture.md` only.*

## [ ] Phase 4 — Home
Build `/` completely, all six sections, copy verbatim from `docs/04-pages.md`.
This includes the **Bansal Standard** signature section — get this right, it sets
the tone for everything else.
*Read: `04-pages.md` § Home + `02-design-system.md` § Signature.*

## [ ] Phase 5 — Appointment flow
`/appointment` page, form with Zod + react-hook-form, `POST /api/appointment`,
Resend templates (client confirmation + internal notification), Sanity write,
rate limiting, honeypot, success state. **Test the full round trip before moving on.**
*Read: `04-pages.md` § Appointment + `03-architecture.md` § Route handlers.*

## [ ] Phase 6 — Story pages
`/legacy`, `/maison`, `/craftsmanship`, `/bespoke`.
Includes the **people at the bench** block (`content/client/10-people.json`) and
the **published commission terms** (`content/client/11-commission-terms.md`) —
both are differentiators, not filler. Nobody named renders without `consentOnFile`.
*Read: `04-pages.md` only.*

## [ ] Phase 7 — Collections
`/collections`, `/collections/[slug]`, and **`/collections/[slug]/[piece]` — the
maker's dossier**, which is the most differentiating page on the site. `PieceCard`
with status chips, the mono spec-row record, `generateStaticParams`.
No enquiry action on any piece. Render only fields that exist.
*Read: `04-pages.md` § Collections + the dossier section, and `03-architecture.md` § Rendering.*

## [ ] Phase 8 — Journal + newsletter
`/journal`, `/journal/[slug]`, portable-text renderer, category filter,
pagination, `POST /api/newsletter` with double opt-in.
*Read: `04-pages.md` § Journal.*

## [ ] Phase 9 — Launch
`/contact`, `/privacy`, `404`, sitemap, robots, JSON-LD, OG images,
Vercel Analytics, Sanity revalidation webhook, Lighthouse pass against the
budget in `03-architecture.md`.

**Launch gate:** `pnpm content:status --strict` must exit 0. This is the only
thing standing between a placeholder buyback percentage and a live page — do not
bypass it, and do not set `_approved: true` on the client's behalf.
*Read: `06-seo.md` only.*

---

## Definition of done (every phase)

- [ ] `pnpm build` passes with zero TS errors and zero ESLint warnings
- [ ] Renders correctly at 360px, 768px, 1440px
- [ ] Keyboard-navigable, visible focus rings
- [ ] `prefers-reduced-motion` honoured
- [ ] No prices, no "buy/shop/sale", no "35 years" anywhere in the diff
- [ ] `pnpm content:status` runs clean of *new* drafts (existing ones are fine)
- [ ] No hardcoded address, hour, percentage or piece title in any component
- [ ] `DraftFlag` and `[TK]` styling are dev-only and cannot render in production
- [ ] No more than three gold elements per viewport
- [ ] Committed with a conventional-commit message
