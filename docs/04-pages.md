# 04 — Pages & Copy

Copy below is **approved and used verbatim**.

Anything the client has not confirmed is **not** left blank — it already exists as
a realistic dummy in `content/client/`, flagged `_approved: false`. Read it from
there via `lib/client-content.ts`. Never hardcode it, and never leave a section
unbuilt waiting for an answer.

---

## `/` Home

Job: convince a sceptical referred visitor, in one scroll, that this house is
honest and skilled — then offer an appointment. Product comes *last*.

**1 — Hero** (pearl)
- Label: `Goldsmiths & jewellers · Malviya Nagar · Since 1993`
- Display XL: *Before there is jewellery, there is trust.*
- Lede: "A family workshop in South Delhi, in its third generation. Every piece
  we sell, we have made. Every stone we set, we can account for."
- Two links: `Request a private appointment` · `See how a piece is made`
- No hero image at launch. A full-bleed workshop photograph replaces the
  negative space once photography is shot.

**2 — The five proofs** (pearl, hairline-separated rows, no icons)
Each row: mono label · display-sm heading · one sentence.
```
MANUFACTURER   Made under our own roof        Nothing is bought in and rebranded. Design, casting, setting, polishing and finishing all happen in our workshop.
CERTIFICATION  Natural diamonds only          GIA and IGI certified. Every gold piece BIS hallmarked and HUID registered. Lab-grown stones are not sold here.
CONTINUITY     One family, one address        Founded in 1993 by Shri Ashok Kumar Bansal. Run today by his sons and nephew, in the same neighbourhood.
TRANSPARENCY   Billed in front of you         Weighing, billing and packing are done at your table. You are told how the price is built before you decide.
AFTERCARE      Serviced for life              Cleaning, polishing, resizing and repair, at no charge, for anything we have made.
```

**3 — The Bansal Standard** (obsidian — the signature section)
Nine lines, verbatim from `docs/01-brand.md`. Scroll-staggered.
Single hairline above, no other ornament, no CTA inside this block.

**4 — Selected work** (pearl-deep)
Six featured pieces from Sanity, `4:5`, reference number in mono beneath each.
No prices, no "enquire" button per card. One link out: `View the collections`.

**5 — The house** (pearl, two-column)
- Display LG: *Thirty-three years at the same bench.*
- Copy: "Shri Ashok Kumar Bansal opened the workshop in 1993 with one belief:
  that jewellery is not an ornament but a part of a family's life — worn at
  weddings, passed to daughters, remembered long after. Three decades on, many
  of the families who came to us in the first years now send their children.
  That is the only measure of success we have ever kept."
- Link: `Our legacy`

**6 — Appointment** (charcoal)
- Display LG: *Come and sit with us.*
- Copy: "There is no obligation and there is no queue. Tell us what the occasion
  is and we will keep an hour aside. Walk-ins are always welcome, but an
  appointment means the person who will make your piece is at the table."
- `ButtonGhost` → `/appointment`

---

## `/legacy` Our Legacy

1. Hero — *A house built one family at a time.*
2. **The founder** — Shri Ashok Kumar Bansal, 1993. Portrait + prose.
   → `content/client/01-founder.md`
3. **Timeline** (from `timelineEvent`) — 1993 founding, first workshop,
   move to Malviya Nagar, second generation joins, manufacturing expansion,
   third generation. → `content/client/02-timeline.json`
4. **The manifesto** (obsidian, verbatim):

> Before there is jewellery, there is trust.
>
> For over three decades we have believed that the most valuable thing we create
> is confidence. Confidence that every recommendation is honest, every diamond is
> authentic, every promise is honoured, and every creation is worthy of becoming
> part of a family's legacy.
>
> Trends change and prices fluctuate, but integrity remains timeless. We do not
> aspire to become the biggest jewellery house. We aspire to become the one
> people trust the most.
>
> Jewellery is inherited, remembered and lived. Trust is what makes it worth
> inheriting.

5. Link to `/craftsmanship`

---

## `/maison` The Maison

The showroom, described honestly. This page converts NRIs and first-time visitors.

1. Hero — *C-50, Malviya Nagar.*
2. **The room** — grey Italian marble, black marble walls, nine seating areas,
   one private cabin. Photography-led once shot.
3. **What a visit is like** — a short prose sequence, not numbered:
   greeted by a member of the family where possible · seated, offered tea ·
   shown pieces on a tray, one at a time, never crowded · told what you are
   looking at and what it costs to make · weighed, billed and packed at your
   table · a blessing before the piece leaves with you.
4. **The people at the bench** — named, with real roles and how long they have
   been here. A referred visitor is verifying *people*, not a corporate identity
   (`docs/07-references.md` § A5). Family and consenting staff only — never clients.
   → `content/client/10-people.json`
5. **Practical** — hours, parking, nearest metro (Malviya Nagar, Yellow Line),
   landmark (Laxmi Narayan Mandir). → `content/client/00-settings.json`
6. **A 360° view or documented photographs of the workshop and showroom**, once
   photography exists. Anderson & Sheppard's tour is the model.
5. CTA → `/appointment`

---

## `/craftsmanship` Craftsmanship

The proof page. Longest page on the site.

1. Hero — *From a sketch on paper to a piece in a box.*
2. **The sequence** (from `processStep`) — this **is** a real ordered process,
   so numbered markers `01–08` are correct here and only here:
   `01 Consultation · 02 Sketch · 03 CAD or hand-forming · 04 Casting ·
    05 Stone setting · 06 Polishing · 07 Quality inspection · 08 Presentation`
   Each step: image, one paragraph, and where relevant a time estimate.
3. **How to read a certificate** (obsidian) — plain-English explanation of a GIA
   report, the 4Cs, what BIS hallmarking and HUID actually guarantee, and why
   the house does not sell lab-grown stones as natural.
4. **How a price is built** — itemised and honest: metal weight × rate,
   making charges, stone value, wastage, GST. State that this breakdown is shown
   on every bill. → `content/client/06-pricing.md` · contains `[TK]` values, will not pass `--strict`
5. **Aftercare & buyback** — what is free, what is chargeable, exchange terms.
   → `content/client/07-aftercare.md` · contains `[TK]` values, will not pass `--strict`

---

## `/collections` + `/collections/[slug]`

Index: category cards from Sanity (bridal, diamond, polki, kundan, jadau,
temple, platinum, gold, gemstone, men's, everyday).

Detail: intro paragraph, then a `4:5` grid. Each card shows image, title,
reference number, and a status chip where relevant — `Sold`, `At the bench`.
Sold pieces stay visible permanently; they are the evidence.

Clicking a card goes to the **maker's dossier** at
`/collections/[collection]/[piece]` — not a lightbox, not a product page.

**No enquiry action anywhere on a piece.** No "Enquire", no "Price on request",
no "Arrange a visit" on the dossier. One CTA at the foot of the *collection*
index only: `Ask about a piece from this collection` → `/appointment`
(no `?ref=` parameter — see `docs/07-references.md` § E2).

Intro line for the index:
"These are pieces we have made. Most are one of a kind and many have already
gone home with someone. They are here to show what is possible, not to be
ordered from a page."

---

## `/collections/[collection]/[piece]` The maker's dossier

The single most differentiating page on the site. No other jewellery house
publishes this. See `docs/07-references.md` § D1.

Layout: images left (sticky on desktop), record right. The record is a series of
mono spec rows with leader dots — the same device used throughout — reading:

```
REFERENCE          BSJ-0417
COMPLETED          March 2016
STATUS             Sold · in the family that commissioned it

METAL              22ct yellow gold
GROSS WEIGHT       48.210 g
NET METAL WEIGHT   31.640 g

STONES             Ruby × 7 · 4.12 ct total · no heat
                   GIA report 2185640912 · no treatment detected
                   Diamond × 112 · 3.88 ct total
                   IGI report 447291006

MADE AT THE BENCH  Wax and casting · Setting · Engraving · Polishing
OUTSOURCED         None
BENCH HOURS        210

HALLMARK           BIS · HUID AZ4419KP
CHECKED BY         Chetan Bansal, 4 March 2016

SERVICED           2019 · claw retipping · no charge
                   2023 · polish and re-strung · no charge
```

Below the record: the description in prose — what it was made for, what happened
at the bench, what came back for service. Under 60 words. Factual, not lyrical.

**Rules**
- Render only fields that exist. Never show an empty row or "N/A".
- `OUTSOURCED — None` is a claim; if any step was outsourced, it must be named.
  Silence here would be worse than the outsourcing.
- Stone treatments are shown whether or not they are flattering.
- No enquiry action, no price, no "similar pieces" carousel.
- Client names never appear. "In the family that commissioned it" is the correct
  register; a surname is not.

---

## `/bespoke` Bespoke Atelier

1. Hero — *Made to a family, not to a season.*
2. Copy: "A commission starts with a conversation, not a catalogue. Bring a
   photograph, a drawing, an old piece you want reworked, or nothing at all.
   We will sketch, price it openly, and show you the piece in progress before it
   is finished. Most commissions take three to five months."
3. The journey — reuses `processStep` but with commission-specific notes
4. **Remodelling** — reworking inherited pieces. Emphasise that original gold and
   stones are retained and returned, and that nothing is melted without consent.
5. CTA → `/appointment` with `interest=bespoke` prefilled

---

## `/journal` + `/journal/[slug]`

Editorial, not SEO filler. Four categories: `Education` (how to buy a diamond,
reading a hallmark), `Craft` (inside the workshop), `The House` (family, milestones),
`Guides` (bridal planning, gifting).

Index: 2-column editorial grid, category filter, 12 per page.
Article: `max-w-[68ch]`, portable text renderer, pull-quotes in Bodoni,
author + date in mono, related posts at foot. Reading time — no.

---

## `/appointment` Private Appointment

Single column, `max-w-[560px]`, obsidian right panel on desktop carrying the
**full address, opening hours, telephone, WhatsApp and email** — beside the form,
not buried in the footer (`docs/07-references.md` § A6). A visitor deciding
whether to come should never have to navigate away to find where "here" is.

Beneath the contact block: the practical pre-visit questions — what to bring,
how long it takes, whether a private cabin can be requested, whether children are
fine, what happens if you are late. Answered plainly, from
`content/client/09-faq.json` group `visiting`.

Fields (exactly these, in this order):
```
Name*                    text
Phone*                   tel, +91 prefixed
Email                    email  (optional — some clients prefer not to)
Preferred date*          date, min today, max +90d
Preferred time*          select: Morning 11–1 / Afternoon 1–4 / Evening 4–6.30
Occasion*                select: Bridal / Engagement / Gift / Everyday /
                                 Remodelling an existing piece / Just looking / Other
Jewellery interest       multi-select from category enum
Budget range             select, optional, clearly marked "Optional"
Brief requirement        textarea
Preferred contact        radio: Phone / WhatsApp / Email
Honeypot                 hidden
```

Above the form: "We keep one hour aside for each appointment. Nothing is
obligatory and nothing is charged."

Below the submit button: "**We will contact you once to confirm, and once more
on the day. We do not call after that, and we do not share your details with
anyone.**"

Success state (replaces form, does not navigate away):
"Thank you. We have your request and will confirm within one working day on
{contactMethod}. If it is urgent, call or WhatsApp +91 85272 92840."

---

## `/contact`

Address, phone, WhatsApp deep link (`https://wa.me/918527292840`), email, hours,
Instagram, static map image linking to Google Maps, GSTIN in the footer.
No form on this page — it points to `/appointment`.

---

## `/privacy`

Plain-language, short. Must state: what the appointment form collects, that it is
emailed and stored in Sanity, retention period, that nothing is sold or shared,
that analytics are cookieless, and how to request deletion.
→ `content/client/08-privacy.md` · draft written, needs legal review

---

## `not-found.tsx` 404

Display LG: *This piece is no longer here.*
Body: "The page you were looking for has moved or was never made. The collections
are a good place to start again."
Links: Home · Collections · Appointment. No illustration, no humour.
