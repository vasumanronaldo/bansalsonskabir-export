# 09 — Change log v1

Source: client review, 15 August 2026 (`assets/mockups/v1-client-changes-2026-08-15.pdf`).
Site under review: `bansal-sons.vasuvij.workers.dev`.

**This file governs.** Where it conflicts with `docs/04-pages.md`, this wins and
`04-pages.md` must be updated to match in the same commit. Facts still come from
`content/client/` — this file says *what* changes, the content files carry the text.

Blocked items are listed in § X. **Do not build a blocked item.** Leave the
existing content in place and report it.

---

## A — Home

| # | Change | Detail |
|---|---|---|
| A1 | Hero sub-line | "A family workshop in South Delhi" → **"A heritage jewellery outlet in South Delhi"**. Rest of the sentence unchanged. |
| A2 | Five proofs, CONTINUITY row | Delete "and nephew, in the same neighbourhood." Row now ends: "Founded in 1993 by Shri Ashok Kumar Bansal. Run today by his sons." |
| A3 | The Bansal Standard | **Delete the last three lines.** Keep six: welcome / educate / listen / build trust / create relationships / never compromise on quality. |
| A4 | Selected work grid | **Remove the BSJ reference code** from every card. Captions come from the piece's own name and description. |

## B — Legacy

| # | Change | Detail |
|---|---|---|
| B1 | Founder section | Replace the prose entirely → `content/client/01-founder.md` (rewritten). |
| B2 | Founder photograph | Replace. **Do not caption it "Shri Ashok Kumar Bansal — at the bench, 1993."** No name caption on this image at all. |
| B3 | Timeline | Replace all six entries → `content/client/02-timeline.json` (rewritten). Years are now 1993 / 1999 / 2006 / 2011 / 2021 / 2023. |
| B4 | Timeline photograph | Replace. |
| B5 | "Every piece, made in this room" | Replace photograph. Image caption becomes **"At the bench"** — remove "C-50". |

## C — Craftsmanship

| # | Change | Detail |
|---|---|---|
| C1 | The sequence | Eight steps, each now carrying a duration → `content/client/03-process.json` (rewritten). Replace all step photographs. |
| C2 | How a price is built | Replace text → `content/client/06-pricing.md` (rewritten). **Remove the making-charge percentage bullets** — the four categories are now listed without figures. Wastage gains a full plain-English explanation. |
| C3 | Aftercare, buyback and exchange | Replace text → `content/client/07-aftercare.md` (rewritten). New line on chargeable gold. Buyback and exchange terms rewritten. |

## D — Collections

| # | Change | Detail |
|---|---|---|
| D1 | **Categories replaced.** Eleven become eight: Bridal Necklace · Commitment Rings · Diamond Necklace · Engagement Rings · Bracelets and Bangles · Earrings · Everyday Jewellery · Men's Jewellery → `content/client/04-collections.json` (rewritten). |
| D2 | **The maker's dossier is removed.** Delete the entire spec-row record from the piece page: reference, completed, status, metal, weights, stones, bench work, outsourced, bench hours, hallmark, checked by, serviced. |
| D3 | Piece pages become **named pieces with prose**. Heading is the piece's name (e.g. "Ratneshvari"), followed by its subtitle and description → `content/client/05-pieces.json` (rewritten). |
| D4 | Remove the PLACEHOLDER paragraph from every piece page. |
| D5 | Replace all piece photography with the client's supplied images. |

Fifteen named pieces supplied: **Ratneshvari, Navratna Rajshri, Shri Lakshmi
Vaibhav, Kanakprabha** (Bridal Necklace) · **Astoria, Elysia, Fleuré, Celeste**
(rings — see X4) · **Seraphine, Elara, Aurelia, Serenity, Saanvi, Valentine,
Verona** (Earrings).

## E — Maison

| # | Change | Detail |
|---|---|---|
| E1 | "The room" | Replace photograph and text. |
| E2 | "What a visit is like" | Six lines become four → `content/client/12-visit.md`. "Seated, and offered tea" is dropped and folded into "made comfortable". |

## F — Bespoke

| # | Change | Detail |
|---|---|---|
| F1 | **Lead time is wrong.** "Most commissions take three to five months" → **"Most commissions take two to four weeks."** Change everywhere it appears. |
| F2 | The journey | Now the same eight steps as Craftsmanship, with durations. See X5. |
| F3 | Deposit | **30%** of the quoted total, credited against the final bill. Plus: "No advances are required if you are a regular." |
| F4 | Changes | **All revisions are free, at any stage** — including after work has begun. The old "revisions after casting are quoted separately" is reversed. |
| F5 | Cancellation | Before casting: deposit returned in full, less the cost of stones already bought to specification. |
| F6 | Delivery | Completion date quoted at sketch stage, held to within the two-to-four-week window. |
| F7 | Who owns the design | "One vision. One creation. Entirely yours." |

→ `content/client/11-commission-terms.md` (rewritten).

## G — Footer

| # | Change | Detail |
|---|---|---|
| G1 | **Remove the GSTIN and the BIS registration number.** Keep the GIA · IGI · BIS Hallmark · HUID marks line. |
| G2 | Replace the logo with the supplied BSJ monogram → `assets/brand/logo-bsj-monogram.png`. |
| G3 | Instagram handle | **BLOCKED — see X6.** |

## H — Appointment

| # | Change | Detail |
|---|---|---|
| H1 | **Valet is offered.** Reverse the parking line: "Street parking is available on the C-block service lane. Valet is offered." Update `content/client/00-settings.json`. |

---

## X — Blocked, or needs a decision before building

**Build everything else. For these, leave the current content in place and report.**

### X1 — RESOLVED: "our own roof" becomes "our own workshops"

The 1999 timeline entry states manufacturing was brought in-house **with its own
facility in Mumbai**. Three places on the site implied a single building in
Malviya Nagar. A Delhi showroom and a Mumbai workshop is entirely normal and
nothing to conceal, but the site cannot say both things.

**Decided.** Apply these exact replacements everywhere they occur:

| Page | Was | Now |
|---|---|---|
| Home, MANUFACTURER proof | "Made under our own roof" | **"Made in our own workshops"** |
| Home, MANUFACTURER proof body | "…all happen in our workshop." | "…all happen in our own workshops." |
| Legacy | "Every piece, made in this room." | **"Every piece, made by us."** |
| Craftsmanship, step 04 | "cast in our own foundry" | unchanged — the foundry is ours |
| Footer strapline | "Made under one roof since 1993." | **"Made by us since 1993."** |

Grep for "our own roof", "one roof", "in this room" and "our workshop" (singular)
before declaring this done. The claim being made is *we manufacture what we sell*,
which stays true and is the point. The claim being dropped is *in this building*,
which was never the argument.

### X2 — RESOLVED: turnaround renders only figures that exist

The figures are not coming for now, and the section must not read as unfinished.

**Decided.** Render each turnaround line **only if it has a figure.** With none
present, the entire Turnaround section — heading, intro and list — does not render
at all. No empty heading, no "— working days" with a blank.

Implement it as a filter on the data, not a hardcoded removal: the moment a figure
is added to `content/client/07-aftercare.md`, that line and the section appear on
their own. The "Stone replacement — quoted after inspection" line has no figure by
design and should render whenever the section is visible.

### X3 — Is Rajeev Bansal a son or a nephew?

The original brief said nephew. The new founder text says *"his sons, Chetan and
Karan, and his son Rajeev."* Both cannot be right. Change A2 removes the word
"nephew" from the homepage, which sidesteps it there, but `10-people.json` and the
founder prose still need one answer. **Confirm with the family.**

### X4 — RESOLVED: default ring assignment

No answer needed from the family. Assigned by convention; changing one is a
one-word edit in `content/client/05-pieces.json`.

| Piece | Collection | Reasoning |
|---|---|---|
| Elysia — classic solitaire | **Engagement Rings** | The solitaire is the engagement archetype |
| Celeste — three-stone | **Engagement Rings** | Past/present/future, conventionally engagement |
| Astoria — diamond halo statement | **Commitment Rings** | Statement halo, worn as a commitment or anniversary piece |
| Fleuré — floral cocktail | **Commitment Rings** | A cocktail ring is not an engagement ring |

### X5 — Craftsmanship and Bespoke now carry identical content

Both pages now run the same eight steps with the same durations and the same text.
Two pages of duplicate content is bad for the reader and bad for search.

Recommended split, for approval: **Craftsmanship** keeps the eight technical steps
as the record of how the house works. **Bespoke** keeps the terms (deposit,
changes, cancellation, delivery, ownership) and links to Craftsmanship for the
process. One process, described once.

### X6 — Instagram handle

The instruction "update Instagram handle to" ends without a handle. Currently
`@bansalsons_jewellers`. **Leave it unchanged until supplied.**

### X7 — The dossier removal is a real loss (FYI, not blocking)

D2 removes the item-level maker's dossier — weights, certificate numbers,
treatment disclosure, bench hours, outsourced steps, QC sign-off. This was the one
thing on the site no competitor in the category does, and it was the strongest
evidence for the transparency argument the whole site rests on.

**Build the change as instructed.** But it is worth putting to the family once,
plainly: the prose descriptions are beautiful and read like every other luxury
jeweller; the dossier read like nobody else. A middle path exists — keep the
prose as the main body, and put four lines beneath it (metal, stones with
certificate, hallmark, made in-house). That keeps the differentiator at a
fraction of the data-entry cost.

### X8 — Voice drift in the new piece descriptions (FYI, not blocking)

The supplied descriptions use "effortlessly timeless", "unmistakably luxurious",
"exceptional brilliance". `docs/01-brand.md` rules these out as superlatives with
no fact behind them.

**Use the client's text verbatim — it is approved copy and their house, their
voice.** `/qa` should not flag these. Noted only so the divergence is deliberate
and on record rather than accidental.


---

## Y — Exact string replacements

Run these greps first; each should return zero matches when the round is done.

```bash
grep -rn "three to five months"  src app components lib content
grep -rn "our own roof\|one roof\|in this room" src app components lib content
grep -rn "and nephew"            src app components lib content
grep -rn "BSJ-"                  src app components lib content
grep -rn "Valet is not offered"  src app components lib content
grep -rn "GSTIN\|BIS-TK"        src app components lib content
grep -rni "dossier"              src app components lib
```

| Find | Replace with | Section |
|---|---|---|
| `A family workshop in South Delhi` | `A heritage jewellery outlet in South Delhi` | A1 |
| `Made under our own roof` | `Made in our own workshops` | X1 |
| `all happen in our workshop.` | `all happen in our own workshops.` | X1 |
| `Every piece, made in this room.` | `Every piece, made by us.` | X1 |
| `Made under one roof since 1993.` | `Made by us since 1993.` | X1 |
| `Run today by his sons and nephew, in the same neighbourhood.` | `Run today by his sons.` | A2 |
| `take three to five months` | `take two to four weeks` | F1 |
| `AT THE BENCH, C-50` | `AT THE BENCH` | B5 |
| `Valet is not offered.` | `Valet is offered.` | H1 |

## Z — Section-to-work map

Fill the file column from `docs/FILEMAP.md` at the start of each session; do not
search for them again afterwards.

| Section | Touches | Content source |
|---|---|---|
| A | Home hero, ProofRow, StandardManifesto, featured grid | `00-settings.json` |
| B | Legacy page, timeline block, founder block | `01-founder.md`, `02-timeline.json` |
| C | Craftsmanship page, process sequence, pricing, aftercare | `03-process.json`, `06-pricing.md`, `07-aftercare.md` |
| D | Collections index, collection page, piece page, PieceCard | `04-collections.json`, `05-pieces.json` |
| E | Maison page, visit block | `12-visit.md` |
| F | Bespoke page, journey, terms | `03-process.json`, `11-commission-terms.md` |
| G | Footer, logo | `00-settings.json` |
| H | Appointment page, contact panel | `00-settings.json`, `09-faq.json` |
