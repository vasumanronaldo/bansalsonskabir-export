# 02 — Design System

Direction: **the showroom, translated.** Grey Italian marble floors, black marble
feature walls, white ceilings with spotlights, brushed gold at hairline weight.
Pearl-white is the default field; charcoal and near-black are used for *feature
sections*, exactly as the black marble wall functions in the physical space.

Restraint is the brief. Gold appears as a 1px rule, a small mark, or a hover
state — never as a fill, never as a gradient, never animated.

---

## Colour tokens

Define in `app/globals.css` under `@theme` (Tailwind v4).

```css
@theme {
  /* Field */
  --color-pearl:        #F7F5F1;  /* default page background */
  --color-pearl-deep:   #EFEBE4;  /* alternating section band */

  /* Ink */
  --color-charcoal:     #22211F;  /* primary text, dark sections */
  --color-obsidian:     #141311;  /* black-marble feature sections */
  --color-stone:        #8C8A85;  /* secondary text, captions */
  --color-stone-light:  #B5B2AB;  /* tertiary, on-dark secondary */

  /* Accent — used sparingly */
  --color-gold:         #B08D57;  /* satin gold: rules, marks, hover */
  --color-gold-soft:    #C9AC7E;  /* on-dark gold text only */

  /* Structure */
  --color-hairline:     rgb(34 33 31 / 0.12);
  --color-hairline-inv: rgb(247 245 241 / 0.14);
}
```

**Gold usage cap:** no more than **three** gold elements visible in any single
viewport. Enforce this in review.

**On dark sections** (`obsidian` / `charcoal`): text is `pearl`, secondary is
`stone-light`, accent is `gold-soft`, rules are `hairline-inv`.

---

## Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Bodoni Moda** (variable, Google Fonts) | Didone, per brief's "Didot". Optical sizing on. Weight 400 only; 500 for very large sizes. |
| Body | **Archivo** (variable, Google Fonts) | Neutral grotesque. 400 / 500. |
| Utility | **IBM Plex Mono** 400/500 | Small caps-style labels, reference numbers, spec rows. Uppercase, letter-spaced. |

Load via `next/font/google` with `display: 'swap'` and subset `latin`.
Preload display + body only; mono is `preload: false`.

> **Upgrade path (recommend to client):** licence a true Didone — Commercial Type
> *Canela*, Klim *Domaine Display*, or Optimo *Genath* — and a proper grotesque
> (*Söhne*, *Suisse Int'l*). Swap via the two font constants in `lib/fonts.ts`.
> Do not attempt this without a licence.

### Type scale (fluid, `clamp`)

```
display-xl   clamp(2.75rem, 7vw, 5.5rem)    Bodoni 400, lh 1.02, ls -0.02em
display-lg   clamp(2.25rem, 5vw, 3.75rem)   Bodoni 400, lh 1.08, ls -0.015em
display-md   clamp(1.75rem, 3.5vw, 2.5rem)  Bodoni 400, lh 1.15
display-sm   clamp(1.25rem, 2.2vw, 1.5rem)  Bodoni 400, lh 1.25

body-lg      1.125rem  Archivo 400, lh 1.65   (lede paragraphs)
body         1rem      Archivo 400, lh 1.65
body-sm      0.875rem  Archivo 400, lh 1.6    (captions, notes)

label        0.6875rem Plex Mono 500, ls 0.16em, uppercase
label-lg     0.75rem   Plex Mono 500, ls 0.12em, uppercase
```

Measure: body copy capped at **`max-w-[62ch]`**. Never full-bleed paragraphs.

---

## Layout

- Container: `max-w-[1240px]`, gutter `clamp(1.25rem, 5vw, 5rem)`
- Vertical rhythm between sections: `clamp(5rem, 11vw, 9rem)`
- Sections separated by a **1px hairline**, not by shadow or card
- Baseline grid of 4px; all spacing is a multiple of 4
- **Zero border radius everywhere.** Marble, glass and gold have hard edges.
  Exception: none.
- No drop shadows. Depth comes from tone, not blur.

### Section rhythm

Alternate the field to mimic the showroom's marble walls, but never more than
two dark sections per page:

```
pearl → pearl → obsidian (feature) → pearl-deep → pearl → charcoal (CTA)
```

---

## Signature element

**The Bansal Standard**, set as a full-bleed obsidian section on the homepage:
nine lines of `display-md` Bodoni, each on its own line, revealed one at a time
on scroll with a 90ms stagger, separated by hairline rules that draw in from
left. No image, no ornament, no gold except a single hairline above the block.

This is the one place the design raises its voice. Everything else stays quiet.
Do not add a second "moment" to compete with it.

---

## Motion

Brief: *elegant, slow, flowing, purposeful.* Nothing bounces. Nothing springs.

```ts
export const ease = [0.22, 1, 0.36, 1] as const;   // expo-out
export const dur  = { fast: 0.4, base: 0.7, slow: 1.1 };
```

**Permitted**
- Fade + 16px rise on scroll entry, `once: true`, `amount: 0.25`
- Staggered children at 60–90ms
- Image reveal: scale 1.04 → 1.0 over 1.1s with an opacity fade
- Hairline rules drawing left→right on section entry
- Hover: 250ms colour/underline transitions only

**Forbidden**
- Parallax, marquee, typewriter, counters ticking up, sparkle/shine sweeps,
  cursor followers, page-transition curtains, autoplaying carousels, spring physics

**Reduced motion:** wrap all Framer Motion variants in a `useReducedMotion()`
check that collapses to opacity-only, or disables entirely. This is not optional.

---

## Imagery

- Editorial, not e-commerce. Negative space, single subject, natural falloff.
- Jewellery shot on **charcoal, stone or black marble** grounds — never white sweep.
- Aspect ratios: `4:5` (portrait pieces), `3:2` (workshop/editorial), `1:1` (grid).
- Every image via `next/image` with `sizes` set. Sanity images use the CDN
  transform pipeline with hotspot/crop.
- **No client faces without `consentOnFile: true` on the CMS record.**

---

## Component inventory (build in this order)

```
layout/    Header (sticky, hairline, transparent→pearl on scroll)
           Footer (obsidian, contact block, hours, GST/BIS marks)
           Container, Section, Hairline
type/      Display, Body, Label, Lede
ui/        LinkArrow, ButtonGhost (bordered, gold hairline), FieldText,
           FieldSelect, FieldDate, FieldTextarea
blocks/    Hero, StandardManifesto (signature), ProofRow, ProcessSequence,
           CollectionGrid, PieceCard, JournalCard, AppointmentForm,
           TrustMarks, ContactBlock, MapEmbed
```

`ButtonGhost` is the only button style: transparent, 1px gold border, mono label,
inverts to gold-fill/obsidian-text on hover. There is no "primary" filled button.
