# Client content

Everything the client has not yet confirmed lives here as a **realistic dummy**
so the site can be built, reviewed and demoed without waiting on anyone.

Edit these files directly in your terminal. Nothing else needs touching.

```bash
pnpm content:status          # what is still unapproved, and what each file needs
pnpm content:status --strict # exits 1 if anything is unapproved (use in CI / pre-launch)
pnpm content:edit founder    # opens 01-founder.md in $EDITOR
```

| File | Holds | Drives |
|---|---|---|
| `00-settings.json` | Address, phone, hours, GSTIN, geo, parking | Header, footer, contact, JSON-LD |
| `01-founder.md` | The founder's story | `/legacy` |
| `02-timeline.json` | Milestone years | `/legacy` |
| `03-process.json` | The eight manufacturing steps | `/craftsmanship`, `/bespoke` |
| `04-collections.json` | Eleven categories | `/collections` |
| `05-pieces.json` | 24 dummy pieces | `/collections/[slug]`, homepage |
| `06-pricing.md` | How a price is built | `/craftsmanship` |
| `07-aftercare.md` | Buyback and exchange | `/craftsmanship` |
| `08-privacy.md` | Privacy policy | `/privacy` |
| `09-faq.json` | FAQs | `/craftsmanship`, `/appointment` |
| `10-people.json` | Who works here, workshop headcount | `/maison`, `/craftsmanship` |
| `11-commission-terms.md` | Deposits, revisions, cancellation, remakes | `/bespoke` |

## How approval works

Each file has `_approved: false` (JSON) or `approved: false` (Markdown front
matter) and a `_needs` / `needs` list.

Set it to `true` only once a human has confirmed the content. Anything still
`false` renders on the site with a small amber `DRAFT` marker in **development
only** — never in production — and `pnpm content:status --strict` will fail the
build, which is what stops a placeholder buyback percentage from going live.

## The `[TK]` marker

`[TK]` means *to come*. It marks a specific number or fact that must be filled
in. Find them all:

```bash
grep -rn "\[TK\]" content/client
```

`pnpm content:status` counts them for you.

## Once real content exists

These files stay as the source of truth for **settings and policy**. Pieces,
collections, journal posts and timeline events move into Sanity so staff can
edit them without the terminal — import with `pnpm content:push`.
