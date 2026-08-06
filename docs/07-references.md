# 07 — References

**Status: awaiting audit.** Fill the tables below, then stop. This file is
evidence, not instruction — see Precedence at the foot.

## Why the reference set is chosen, not searched

Searching "best jewellery websites" returns Shopify D2C stores: Mejuri, Catbird,
Kendra Scott, BaubleBar. Those sites are optimised for cart conversion, trust
badges and product filtering. Bansal Sons sells nothing online. Averaging that
reference class produces an e-commerce brief and would contradict the spec.

The correct comparison set is houses that **do not sell online**, are
**appointment-first**, and **make what they sell**.

---

## Tier 1 — High jewellery, no e-commerce

The closest peers. Study restraint, archive presentation, and how they handle
"no prices" without seeming evasive.

| House | Why it's here |
|---|---|
| **Hemmerle** (Munich) | The benchmark for restraint. Fourth-generation family workshop, no online sale, brutally sparse site |
| **Bhagat** (Mumbai) | Viren Bhagat. Indian, world-class, almost aggressively discreet. The single most relevant reference on this list |
| **JAR** (Paris) | Famous for having almost no web presence at all. Worth seeing what near-absence looks like |
| **Taffin** (New York) | James de Givenchy. Personality-led without being loud |
| **Glenn Spiro** (London) | By-appointment, no prices, strong craft narrative |
| **Wallace Chan** (Hong Kong) | Craft-as-argument taken to its extreme |

## Tier 2 — Archive and provenance presentation

For `/collections`. These show pieces without selling them.

| House | Why it's here |
|---|---|
| **Siegelson** (New York) | Estate jewellery. The best archive/provenance presentation anywhere |
| **Belperron** | Archive-led, house history carrying the commercial weight |
| **Verdura** | Heritage catalogue done as editorial |
| **Fred Leighton** | Period pieces with real records |

## Tier 3 — Structural analogue: Savile Row

**Read this tier most carefully.** Bespoke tailors are structurally identical to
this brief — manufacturer, appointment-first, no published prices, generational
clients, one address, a workshop upstairs. Their sites have solved exactly the
problems we have.

| House | Why it's here |
|---|---|
| **Anderson & Sheppard** | The cleanest "we make it here, come and sit down" site in existence |
| **Huntsman** | House history and the commission journey |
| **Cifonelli** | Craft photography without gloss |
| **Edward Sexton** | Personality plus process |

## Tier 4 — Quiet luxury, adjacent categories

For tone, motion and editorial rhythm only — not for structure.

| House | Why it's here |
|---|---|
| **Loro Piana** | Named in the client brief. Material storytelling |
| **Brunello Cucinelli** | The best "house values" page in luxury; does what our `/legacy` must do |
| **Aman** | Hospitality. Restraint, appointment logic, sense of place |
| **Hermès Horloger** | Craft films, no urgency |

## Tier 5 — Indian market, for calibration

Not aspirational targets. Study what local clients already expect, and where the
category is weak enough to be beaten.

| House | Why it's here |
|---|---|
| **Hazoorilal Legacy** (Delhi) | Direct competitor. Know it in detail |
| **Sabyasachi Jewellery** | Heritage-maximalist — the opposite pole. Useful as a boundary |
| **Studio Renn** (Mumbai) | Contemporary Indian house with a genuinely strong digital identity |
| **Amrapali** (Jaipur) | Category-adjacent, heritage-led |

---

## Audit output — completed 2026-08

**Access note:** official sites verified for Hemmerle, Taffin, Glenn Spiro,
Wallace Chan, Siegelson, Belperron, Verdura, Fred Leighton, Anderson & Sheppard,
Huntsman, Cifonelli, Edward Sexton, Loro Piana, Brunello Cucinelli, Aman, Hermès,
Hazoorilal Legacy, Sabyasachi, Studio Renn, Amrapali.
**No verifiable official site found for Bhagat or JAR** — consistent with both
houses' known near-absence from the web. No observations recorded for either.

### A. Patterns to adopt

| # | Pattern | Seen at | Applies to | Status |
|---|---|---|---|---|
| A1 | Keep sold pieces visible, labelled **Sold**, retaining maker, date, materials, dimensions, provenance and significance | Siegelson | `/collections` | **Adopted** |
| A2 | History as dated, verifiable milestones — premises, handovers, workshop changes | Hemmerle, Belperron, Anderson & Sheppard | `/legacy` | Already in spec |
| A3 | Commission explained as an ordered sequence from first consultation to delivery | Anderson & Sheppard, Huntsman | `/bespoke`, `/craftsmanship` | Already in spec |
| A4 | Concrete workshop facts — what is made onsite, headcount, indicative labour hours | Hemmerle (15 goldsmiths, pieces exceeding 500 hours) | `/craftsmanship` | **Adopted** — needs real numbers |
| A5 | Name the people a visitor will actually meet, with their real roles | Anderson & Sheppard, Huntsman | `/maison`, `/bespoke` | **Adopted** — gap in spec |
| A6 | Address, hours, telephone and email published *beside* the appointment invitation, not only in the footer | Hemmerle, Anderson & Sheppard, Verdura | `/appointment` | **Adopted** |
| A7 | Let visitors inspect the real premises — documented images or a virtual tour | Anderson & Sheppard (360 tour) | `/maison` | **Adopted** — deferred to photography |
| A8 | Work presented as named projects with materials beneath, no transactional language | Hemmerle | `/collections` | Already in spec |
| A9 | Institutional recognition — museum loans, exhibitions, dated | Hemmerle, Wallace Chan | — | **Not applicable.** No institutional record exists. Do not manufacture one |
| A10 | Answer practical pre-appointment questions openly | Anderson & Sheppard, Huntsman | `/appointment` | **Adopted** — FAQ moves here |
| A11 | Journal documents real workshop activity, not marketing events | Anderson & Sheppard, Wallace Chan | `/journal` | Already in spec |

### B. Patterns to avoid

| # | Pattern | Seen at | Why it's wrong here |
|---|---|---|---|
| B1 | "Price on Request" mixed with product grids and "Shop Now" | **Hazoorilal Legacy** (direct competitor) | Reads as a broken shop, not a deliberate position. Hidden pricing feels evasive rather than private |
| B2 | An **Enquire** action on every archived or sold object | Siegelson | Turns the archive into a shadow catalogue where every piece is bait for private negotiation |
| B3 | "Arrange Your Visit" repeated on individual piece pages | Belperron | Makes the appointment product-led; visitors arrive asking about one image instead of their occasion |
| B4 | Cart, account, wishlist, currency and shipping infrastructure around bespoke content | Huntsman, Edward Sexton, Cifonelli | Imports the mental model of online retail into a service that is personal and appointment-based |
| B5 | Celebrity galleries as a central trust mechanism | Huntsman, Hazoorilal Legacy | Recognition signals status. It does not establish honesty, competence or fair dealing |
| B6 | Testimonials with generic first names and unverifiable praise | Amrapali | Anonymous admiration is weaker than named artisans, documented process and dated work |
| B7 | A near-empty image-led site with only biography, press and contact | Taffin | **Most important finding.** Exclusivity cannot substitute for verification when the visitor is specifically investigating credibility |
| B8 | Multiple boutiques, private-viewing cities and trunk-show calendars | Glenn Spiro, Huntsman | Bansal Sons gains credibility from one known Delhi address. Geographic diffusion weakens that |

### C. Per-page notes

| Page | Closest reference | Does better | Do differently |
|---|---|---|---|
| Home | Anderson & Sheppard | Surfaces address, people, workrooms and process as evidence of a functioning house | Ignore its separate retail-shop logic; verification stays on the workshop |
| `/legacy` | Hemmerle | Ties each dated milestone to a commission, generation or premises | Use documented Bansal handovers and Malviya Nagar continuity, not society mythology |
| `/maison` | Anderson & Sheppard (360 tour) | Makes the premises inspectable rather than a footer detail | Add practical Delhi facts — access, parking, hours, etiquette — instead of ceremony |
| `/craftsmanship` | Hemmerle | Measurable proof: onsite production, no outsourcing, headcount, 500+ hour pieces | State precisely what is in-house, what is specialist-partnered, and where QC sits |
| `/collections` | Siegelson | Catalogued records with provenance and significance retained after sale | Remove every per-piece enquiry action |
| `/bespoke` | Huntsman | Explains consultation and names who guides the client | Disclose approval stages, permitted revisions, deposits, delivery expectations, and what the house will refuse to make |
| `/journal` | Wallace Chan | Dated record of real activity | Prioritise workshop records and material education over event publicity |
| `/appointment` | Hemmerle | Address, hours, phone, email and a clear recommendation to arrange a private visit | One house-level request; state response time and what to bring. Never a form per piece |

### D. Three things nobody does

**D1 — Item-level maker's dossier.** Across every accessible archive, no house
publishes a record combining raw weights, stone-report identifiers, treatment
disclosures, operations performed, outsourced steps and final maker/QC sign-off
for a single piece. **Adopted. This becomes the site's primary differentiator.**

**D2 — A plain-English commission agreement published *before* the appointment.**
The tailors explain stages; jewellers describe commissions emotionally. Nobody
publishes design ownership, deposit treatment, permitted revisions, cancellation
rules, delivery tolerances and remake responsibility in one place, in advance.
**Adopted.**

**D3 — Public aftercare standards with performance data.** No house publishes
service scope, exclusions, expected turnaround, third-party damage responsibility,
or anonymised annual repair/remake figures. **Partially adopted** — scope,
exclusions, turnaround and liability yes; published annual complaint figures no
(unverifiable at launch and a hostage to fortune).

### E. Conflicts with the spec — decided

| # | Conflict | Resolution |
|---|---|---|
| E1 | D1 requires a per-piece detail page. Spec (`04-pages.md`) had a lightbox only | **Spec amended.** New route `/collections/[collection]/[piece]`. This is the change that makes D1 possible |
| E2 | `04-pages.md` had `Ask about a piece from this collection → /appointment?ref=`. B2/B3 warn against piece-anchored enquiry | **Kept, narrowed.** One CTA at the foot of the *collection*, no `?ref=` param, no CTA on the dossier page |
| E3 | A9 (museum loans) has no Bansal equivalent | **Rejected.** Manufacturing an institutional record would breach `CLAUDE.md` § no invented awards |
| E4 | A5 names individuals; `CLAUDE.md` forbids naming people without consent | **Adopted with condition.** Applies to *family and staff* who consent, never to clients |

## Precedence — read before using this file

1. `CLAUDE.md` — facts and prohibitions. Beats everything.
2. `docs/02-design-system.md` and `docs/04-pages.md` — **the spec. Governs.**
3. This file — **evidence. Informs, never overrides.**

If a reference suggests something the spec forbids, the spec wins and it goes in
section D. Do not edit `02` or `04` from this file without being asked.

**Claude Code:** read this file only when explicitly told to. It is not in the
`CLAUDE.md` router on purpose — it is background, and loading it during a build
phase wastes context.
