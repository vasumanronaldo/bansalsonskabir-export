# 08 — Mockup review

Reference image: `assets/mockups/v1-chatgpt-2026-08.png` (ChatGPT, August 2026).

**Status: visual reference only.** This is a mood and layout reference. It is
**not** a spec and it contains factual errors. `docs/02-design-system.md` and
`docs/04-pages.md` still govern. Where they disagree with the mockup, they win.

**Claude Code: do not read this file during a build phase.** Read it only if
explicitly asked to review layout against the mockup.

---

## 1. Factual errors — must never reach code

Every one of these appears in the mockup and every one is wrong.

| Mockup says | Correct | Where |
|---|---|---|
| "Shri **Surendra** Bansal" | **Shri Ashok Kumar Bansal** | Legacy prose and timeline |
| "**A-58**, Malviya Nagar" | **C-50** Malviya Nagar, Near Laxmi Narayan Mandir | Footer, showroom, appointment |
| "+91 11 2667 1436" | **+91 85272 92840** | Footer, showroom, appointment |
| "info@bansalsons.com" | **bansalsonsjewellers18@gmail.com** | Footer, appointment |
| "© 2024" | Current year, generated | Footer |
| Timeline 1993 / 2001 / 2008 / 2016 / 2023 | Unconfirmed — use `content/client/02-timeline.json` | Legacy |
| Hours "Mon–Sat 10:30–19:00" | Unconfirmed — use `content/client/00-settings.json` | Footer, showroom |
| "REQUIRE about a commission" | "Enquire about a commission" | Bespoke CTA |

The founder's name being wrong is the single worst error here. On a site whose
argument is *we are honest and we are this family*, it is disqualifying.

**Rule:** no fact enters a component from a mockup. Facts come only from
`content/client/` via `lib/client-content.ts`.

## 2. Photography — cannot ship

Every image in the mockup is AI-generated, including **the faces of the founder,
the family and the craftsmen at the bench.**

Synthetic photographs of fake people, on a site arguing for the honesty of a real
family, is the most damaging thing this project could do. One reverse-image search
by one sceptical visitor ends the argument permanently.

Use `<Placeholder>` until real photography exists. The mockup is useful only as a
**shot list** for the photographer:

- Hands at the bench holding a piece, dark ground, shallow depth *(hero)*
- The showroom interior, wide, lit as it actually is *(maison)*
- A goldsmith working, from behind or side, no posed portraits *(craftsmanship)*
- A drawing in progress under a hand *(bespoke)*
- Three or four pieces on dark ground, `4:5` *(collections)*
- The shopfront and the street *(journal, contact)*
- A real family portrait, all three principals *(legacy)*

## 3. Spec violations to correct

| # | In the mockup | Why it's wrong | Fix |
|---|---|---|---|
| V1 | Four decorative gold icons under the hero facts | `02-design-system.md`: no icons on proof rows; three-gold-element cap | Keep the four facts, drop the icons, set labels in mono |
| V2 | Craftsmanship's `DESIGN / HANDCRAFTED / QUALITY / INTEGRITY` icon row — "Integrity: honest materials, honest values" | This is the **abstract-value wall** banned in `01-brand.md`. It asserts integrity instead of demonstrating it | Replace with the eight-step process and the workshop numbers from `10-people.json` |
| V3 | Headings set in caps serif (Trajan/Cinzel register) | Spec is **Bodoni Moda, sentence case**. Caps serif reads civic-monument, not maison | Sentence case throughout, per the type scale |
| V4 | Warm cream / tan / sepia field | Palette is Pearl White `#F7F5F1`, Stone Grey, Charcoal, with satin gold at hairline. The real showroom is **grey** Italian marble and **black** marble, not beige | Use the tokens as written |
| V5 | **The Bansal Standard section is missing entirely** | It is the signature element — the one loud moment in the whole design | Add as a full-bleed obsidian section on the home page |
| V6 | Collection cards show title + year only; no piece pages | Loses the maker's dossier, the primary differentiator (`07-references.md` § D1) | Cards link to `/collections/[slug]/[piece]` |
| V7 | No `Sold` / `At the bench` status on pieces | `07-references.md` § A1 — retained sold pieces are the evidence | Add status chips |
| V8 | A `FILTER ☰` control on Collections | Imports the e-commerce mental model (§ B4) | Category tabs only, no filter drawer |
| V9 | Hero headline "Three generations. One promise." | A slogan. The client's own line is stronger and is already approved | "Before there is jewellery, there is trust." |
| V10 | No people named anywhere ("Meet our craftsmen" links out) | § A5 — a referred visitor is verifying people | Name them on `/maison`, from `10-people.json` |

## 4. What the mockup gets right — keep

1. **The hero.** Dark ground, hands, one piece, no chrome. Closest thing to a
   thesis image in the set. Keep the composition exactly.
2. **The four-fact strip below the hero** — Est. 1993 / Third generation /
   Manufacturer / By appointment. This is the five-proofs row in embryo. Add
   *Certification* as the fifth and remove the icons.
3. **"A curated archive"** as a dark full-bleed band. Correct framing, correct
   word. It matches the archive thesis exactly.
4. **The Legacy timeline** — horizontal, dated, restrained. Good treatment.
5. **The showroom photo grid** — one wide plus three narrow. Right structure.
6. **The five-step bespoke process** (Consultation → Design → Crafting → Approval
   → Delivery). This is the correct *client-facing* abstraction for `/bespoke`;
   the eight technical steps stay on `/craftsmanship`. **Adopt both.**
7. **The appointment form layout** — left column contact, right column fields.
   Matches § A6.
8. **Overall restraint level.** No carousels, no popups, no gradients, zero
   border-radius. The instinct is right.

## 5. Verdict

Adopt items 1–8 of § 4 as layout direction. Correct everything in § 1–3 before a
line of it is built. The mockup's structure is broadly sound; its **facts, faces,
palette and typography are not**, and it is missing the two things that make this
site different from every other jeweller's — the Bansal Standard and the dossier.
