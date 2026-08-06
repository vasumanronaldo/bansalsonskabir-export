# Reference audit — prompt for ChatGPT

Use ChatGPT (with browsing on) for **one job only**: auditing the reference set
and reporting patterns. Not for designing pages, not for writing copy, not for
proposing a layout.

Why the limit: `docs/02-design-system.md` and `docs/04-pages.md` are already the
page spec. A second spec means Claude Code has two sources describing the same
pages. It will either read both — expensive — or follow the wrong one. Two specs
is the most reliable way to double a build's cost.

Paste the block below. Attach `docs/07-references.md` if you can.

---

```
You are auditing competitor and reference websites for a project brief I have
already written. You are NOT designing anything. Do not propose layouts, write
copy, invent a design system, or suggest page structures. If you find yourself
writing "the homepage should…", stop — that is out of scope.

THE PROJECT

Bansal Sons Jewellers. A family jewellery house and manufacturer in Malviya
Nagar, South Delhi, founded 1993, now in its third generation. Building a
brochure website with NO e-commerce: no prices, no cart, no checkout, ever. The
only conversion is a private appointment request. The site's job is to make a
sceptical visitor — usually someone who arrived via a personal referral and is
verifying the house before visiting — believe these people are honest and
skilled. Pieces are shown as an archive, not a catalogue.

IMPORTANT — REFERENCE CLASS

Do NOT look at Mejuri, Catbird, Kendra Scott, BaubleBar, Blue Nile, Brilliant
Earth, or any listicle titled "best jewellery websites". Those are D2C e-commerce
stores optimised for cart conversion and they are the wrong class entirely. If a
source talks about trust badges, product filtering or conversion rate, discard it.

Audit these instead, in this priority order:

TIER 1 — high jewellery, no e-commerce
Hemmerle, Bhagat (Viren Bhagat, Mumbai), JAR, Taffin, Glenn Spiro, Wallace Chan

TIER 2 — archive and provenance presentation
Siegelson, Belperron, Verdura, Fred Leighton

TIER 3 — Savile Row bespoke tailors (STUDY THESE MOST CLOSELY)
Anderson & Sheppard, Huntsman, Cifonelli, Edward Sexton
These are structurally identical to my brief: manufacturer, appointment-first,
no published prices, generational clients, one address, workshop upstairs. They
have already solved the exact problems I have.

TIER 4 — quiet luxury, tone only
Loro Piana, Brunello Cucinelli, Aman, Hermès Horloger

TIER 5 — Indian market calibration
Hazoorilal Legacy (Delhi, direct competitor), Sabyasachi Jewellery,
Studio Renn, Amrapali

If a site is down or has changed, say so rather than describing it from memory.
Tell me plainly which ones you could actually access.

WHAT I WANT BACK — exactly four sections, markdown, no preamble

A. PATTERNS TO ADOPT
A table: Pattern | Seen at | Which page of mine it applies to | Why it works
for a house that sells nothing online.
Maximum 12 rows. Be specific and mechanical — "the collection index shows a
reference number and year beneath each piece and nothing else" is useful;
"elegant minimalist design" is not. Prefer patterns you saw at more than one
house.

B. PATTERNS TO AVOID
A table: Pattern | Seen at | Why it's wrong for this house.
Maximum 8 rows. Include things the good references do that would still be wrong
for me. I am particularly interested in how houses handle "no prices" badly —
evasiveness, "price on request" buttons, gated content, enquiry forms per piece.

C. PER-PAGE NOTES
For each of: home, legacy/history, showroom, craftsmanship/process, collections,
bespoke/commission, journal, appointment.
Maximum FIVE lines per page. Each: the closest single reference, the one thing
it does better than a standard approach, and one thing worth doing differently.

D. THREE THINGS NOBODY DOES
Patterns absent across the whole set that would be an advantage for a house
whose entire positioning is transparency. I have already decided to publish how
a price is built — making charges, wastage, stone value, GST — which none of
these houses do. Tell me three more in that spirit.

CONSTRAINTS ON YOUR OUTPUT

- No layout proposals, no wireframes, no colour or font recommendations.
- No copywriting.
- Cite the specific site for every observation. If you did not see it, say so.
- If you cannot verify a claim, leave it out rather than guessing.
- Total length under 1,500 words. Density over completeness.
```

---

## What to do with the output

1. Paste sections A–D into `docs/07-references.md` under the matching headings.
2. Read section A yourself and delete anything that contradicts
   `docs/02-design-system.md`. Move real conflicts into section D of that file.
3. **Do not edit `02-design-system.md` or `04-pages.md` from the audit** without
   deciding each change yourself. That decision is a human one.
4. `docs/07-references.md` is deliberately **not** in the `CLAUDE.md` router.
   Claude Code reads it only when told:

   ```
   Read docs/07-references.md sections A and C, then rebuild the
   collections index. Spec still governs — flag conflicts, don't resolve them.
   ```

## One honest caveat

An audit tells you what everyone else already does. Following it closely produces
a site that is competent and forgettable — a perfectly averaged high-jewellery
website. Section D is the part that matters most: the gap in the market, not the
consensus. Weight your reading accordingly.
