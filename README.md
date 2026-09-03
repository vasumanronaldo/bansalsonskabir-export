# Bansal Sons Jewellers — deployable handoff

The complete Bansal Sons Jewellers website — catalogue, journal, images and self-hosted admin portal (Next.js on Cloudflare Workers, D1 + R2). This repo is self-contained: a fresh Cloudflare account goes live in ~30 minutes.

**Deploy (one command, full steps in [`DEPLOY.md`](DEPLOY.md)):** `pnpm install` then `./scripts/setup.sh`.

**Download the packaged build:** [bansal-sons-deploy.tar.gz — Release v1.0](https://github.com/vasumanronaldo/bansalsonskabir-export/releases/download/v1.0/bansal-sons-deploy.tar.gz) (untar → `pnpm install` → `wrangler login` → `./scripts/setup.sh`).

> ⚠️ **PRIVATE — contains personal data.** `data/snapshot.sql` includes real customer names and phone numbers. Keep this repository private, never fork or make it public, and **delete `data/snapshot.sql` once deployment is complete.**

---

## Development (existing project docs)

Next.js 15 · TypeScript · Tailwind v4 · Sanity · Vercel

## Start

**New here? Open `START-HERE.md`.** It has the exact terminal commands and
the kickoff prompt.


```bash
pnpm install
cp .env.example .env.local     # fill in Sanity + Resend keys
pnpm dev                       # site  → localhost:3000
                               # studio → localhost:3000/studio
```

## With Claude Code

```bash
claude
```

`CLAUDE.md` loads automatically. It is a router — it tells Claude which single
doc to read for the task at hand, so no session pulls in the whole spec.

| Command | Does |
|---|---|
| `/phase` | Builds the next unfinished phase from `docs/05-build-order.md`, then stops |
| `/section` | Builds one named page section, e.g. `/section /craftsmanship — The sequence` |
| `/copy` | Writes copy in the house voice with a self-check |
| `/qa` | Runs the brand + design + code gate over the current diff |

## Docs

| File | Contains |
|---|---|
| `CLAUDE.md` | Facts, prohibitions, working rules, doc router |
| `docs/01-brand.md` | Voice, positioning, the five proofs, customer fears |
| `docs/02-design-system.md` | Colour, type, layout, motion, components |
| `docs/03-architecture.md` | Routes, CMS schema, integrations, perf budget |
| `docs/04-pages.md` | Page-by-page sections with approved copy |
| `docs/05-build-order.md` | Nine phases, one per session |
| `docs/06-seo.md` | Keywords, metadata, JSON-LD, Google Business Profile |
| `docs/07-references.md` | Competitor audit. Evidence only — the spec governs |
| `REFERENCE-PROMPT.md` | The prompt to run the audit in ChatGPT |
| `docs/08-mockup-review.md` | Review of the v1 mockup. Layout reference only |
| `docs/09-changes-v1.md` | Client revision round, 15 Aug 2026. Governs while active |
| `CHANGE-PROMPT.md` | The prompt to run that revision round |
| `docs/10-admin-portal.md` | Self-hosted admin portal: schema, auth, images, screens |
| `admin/schema.sql` | D1 schema, ready to apply |
| `admin/skeleton/` | Auth implementation, route table, worker types |
| `ADMIN-PROMPT.md` | The prompt to build the portal |

## Client content

Nothing is blocked. Every unconfirmed fact ships as a realistic dummy in
`content/client/`, editable from the terminal.

```bash
pnpm content:status            # what is still draft, and what each file needs
pnpm content:status --strict   # exits 1 — the pre-launch gate
pnpm content:edit pricing      # opens content/client/06-pricing.md in $EDITOR
grep -rn "\[TK\]" content/client   # every unfilled number
```

Unapproved content renders with an amber `DRAFT` chip **in development only**.
`[TK]` marks a specific number that must be filled. `pnpm check:launch` blocks a
production build while either remains.

Still worth chasing the family for, in order of impact:

1. Making-charge and buyback percentages (`06-pricing.md`, `07-aftercare.md`) —
   these are the pages that differentiate the house, and shipping them wrong is
   worse than not shipping them
2. Photography — workshop, showroom interior, 20–30 pieces, family portrait
3. The founder's story in his own words (`01-founder.md`)
4. Real timeline years (`02-timeline.json`)
5. Hours, parking, GSTIN, exact geo coordinates (`00-settings.json`)
6. Legal review of `08-privacy.md` against the DPDP Act, 2023
7. Domain and Google Business Profile access
