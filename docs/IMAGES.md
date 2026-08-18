# Images extracted from the client PDF

Source: `Notes_-_Evernote.pdf` (client review, 15 August 2026), 51 embedded
images, 28 of them usable. Naming matches the slugs in
`content/client/05-pieces.json` and the step order in `03-process.json`.

## Where they go

```
public/images/pieces/     → piece pages and the homepage grid
public/images/process/    → /craftsmanship sequence, /bespoke journey
public/images/house/      → /legacy, /maison
public/images/brand/      → header and footer logo
```

## Pieces (15)

| File | Piece | Collection |
|---|---|---|
| `ratneshvari.jpg` | Ratneshvari | Bridal Necklace |
| `navratna-rajshri.jpg` | Navratna Rajshri | Bridal Necklace |
| `shri-lakshmi-vaibhav.jpg` | Shri Lakshmi Vaibhav | Bridal Necklace |
| `kanakprabha.jpg` | Kanakprabha | Bridal Necklace |
| `astoria.jpg` | Astoria | Commitment Rings |
| `elysia.jpg` | Elysia | Engagement Rings |
| `fleure.jpg` | Fleuré | Commitment Rings |
| `celeste.jpg` | Celeste | Engagement Rings |
| `seraphine.jpg` | Seraphine | Earrings |
| `elara.jpg` | Elara | Earrings |
| `aurelia.jpg` | Aurelia | Earrings |
| `serenity.jpg` | Serenity | Earrings |
| `saanvi.jpg` | Saanvi | Earrings |
| `valentine.jpg` | Valentine | Earrings |
| `verona.jpg` | Verona | Earrings |

**Verify these pairings before publishing.** They were matched by page order in
the PDF, where the image sits on the page *before* its caption. The ordering is
consistent throughout, but a mislabelled piece on a jeweller's site is a bad
error — have someone who knows the stock check all fifteen.

## Process (8)

`01-consultation` · `02-sketch` · `03-cad-hand-forming` · `04-casting` ·
`05-stone-setting` · `06-polishing` · `07-quality-inspection` · `08-presentation`

Note: `01-consultation.jpg` is the same photograph as `house/timeline.jpg`.
Pick one, or ask the client for an alternative.

## House (4)

| File | Use | Notes |
|---|---|---|
| `showroom-interior.jpg` | `/maison`, "The room" | **A real photograph of the actual showroom.** The single most valuable image here |
| `founder-at-bench.jpg` | `/legacy`, founder section | No name caption — per change B2 |
| `at-the-bench.jpg` | `/legacy`, "Every piece, made by us" | Caption "At the bench", no C-50 |
| `timeline.jpg` | `/legacy`, timeline | |

## Brand (1)

`logo-bsj-monogram.jpg` — the BSJ monogram, gold on black.

**This is a JPEG on a black background and cannot be used as-is.** Ask the client
for the original vector (`.ai`, `.eps` or `.svg`). If none exists, it needs
tracing to SVG with a transparent background so it works on both the pearl and
obsidian fields. A JPEG logo with a baked-in black box will look broken on every
light section of the site.

## Provenance — read before publishing

Several of these are **stock or AI-generated**, not photographs of this house's
own work. `showroom-interior.jpg` is unambiguously real. The bench and process
photographs appear to be stock. The piece images are catalogue renders.

That is fine for pieces and acceptable for process, but the same rule as before
holds: **no synthetic photographs of people presented as this family or their
craftsmen.** Check each face-bearing image with the client before it ships.
