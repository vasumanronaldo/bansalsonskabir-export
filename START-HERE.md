# START HERE

Everything you need to go from a downloaded zip to Phase 1 built.

---

## 1. Terminal — setup (once)

```bash
# unzip wherever you keep projects
cd ~/projects
unzip ~/Downloads/bansal-sons-blueprint.zip
cd bansal-sons

# check your tooling
node -v          # need 20 or newer
pnpm -v          # if missing: npm i -g pnpm
claude --version # if missing: npm i -g @anthropic-ai/claude-code

# put it under version control BEFORE Claude Code touches anything
git init
git add -A
git commit -m "chore: project blueprint, docs and dummy client content"

# confirm the content tracker runs
node scripts/content-status.mjs
```

That last command should print twelve `DRAFT` rows and 70 `[TK]` markers. If it
does, the scaffold is intact.

---

## 2. Terminal — start Claude Code

```bash
claude
```

`CLAUDE.md` loads automatically. Paste **Prompt A** below as your first message.

---

## 3. Prompt A — first session only

```
This repo contains a complete written specification for a jewellery maison's
website. There is no code yet. Your job is to build it, phase by phase, exactly
to spec.

Before writing anything:

1. Read CLAUDE.md in full. It is a router — it tells you which single doc to read
   for a given task. Honour it. Do NOT read all of /docs in one go; the spec is
   split deliberately so no session carries context it does not need.
2. Read docs/05-build-order.md and confirm which phase is next.
3. Do not scaffold ahead of the current phase. Do not install a dependency that
   is not listed in CLAUDE.md under Stack without asking me first.

Then build Phase 1 only, and stop.

Five things to internalise before you write a line, because these are the ones
most likely to go wrong:

- This site sells nothing. No price, no cart, no "shop", no urgency. The only
  conversion is a private appointment request. If a component starts looking like
  a product page, you have drifted.

- The house was founded in 1993. That is 33 years, not 35. The client's own brief
  says "35+" and it is wrong. Never write it.

- Nothing is blocked on the client. Every unconfirmed fact — hours, buyback
  percentages, the founder's story, piece descriptions — already exists as a
  realistic dummy in content/client/, flagged _approved: false. Read all of it
  through lib/client-content.ts. Never hardcode an address, an hour, a percentage
  or a piece title into a component. Never invent a new placeholder inline: add it
  to the relevant file in content/client/ with a [TK] marker instead.

- Restraint is the design. Gold is a hairline accent, capped at three elements per
  viewport. Zero border-radius, no shadows, no gradients, no sparkle. The one
  place the design is allowed to be loud is the Bansal Standard section on the
  home page. Everything else stays quiet so that section can land.

- Never use AI-generated or stock photography of people. Use the Placeholder
  component until real photographs exist.

When Phase 1 is done: run /qa, mark the phase complete in docs/05-build-order.md,
commit, summarise in under ten lines, and stop. I will tell you when to start
Phase 2.
```

---

## 4. Every session after that

Start a **fresh session** for each phase — this is where most of the token saving
comes from.

```bash
cd ~/projects/bansal-sons
claude
```

Then:

```
/phase
```

That's it. It reads the build order, finds the next unfinished phase, reads only
the docs that phase names, builds it, runs the checks, marks it done, commits,
and stops.

### The other commands

| Command | Use when |
|---|---|
| `/phase` | Standard build session |
| `/qa` | Before any commit. Reads the diff, not the repo |
| `/section /craftsmanship — The sequence` | Rebuilding one named section |
| `/copy a short intro for the polki collection` | New copy in the house voice |

### Reviewing against the mockup

The mockup review is deliberately kept out of the router. Load it explicitly:

```
Read docs/08-mockup-review.md sections 3 and 4, then review the home page
against it. Spec still governs — list conflicts, do not resolve them.
```

---

## 5. Editing client content

Any time a real answer arrives from the family:

```bash
pnpm content:status              # what's still draft
pnpm content:edit pricing        # opens 06-pricing.md in $EDITOR
grep -rn "\[TK\]" content/client # every unfilled number
```

Set `_approved: true` only once a human has actually confirmed it.

---

## 6. Before you go live

```bash
pnpm check:launch
```

Runs `content:status --strict`, typecheck and build. It **will fail** while any
`[TK]` or unapproved file remains. That is the point — it is the only thing
standing between a placeholder buyback percentage and a live page. Do not bypass
it, and do not flip `_approved` on the client's behalf.

---

## The nine phases

| # | Builds |
|---|---|
| 1 | Foundation — tokens, layout primitives, content loader |
| 2 | Design primitives — type, buttons, header, footer, kitchen sink |
| 3 | Sanity CMS + Studio |
| 4 | Home page, including the Bansal Standard |
| 5 | Appointment flow, end to end |
| 6 | Legacy, Maison, Craftsmanship, Bespoke |
| 7 | Collections + the maker's dossier |
| 8 | Journal + newsletter |
| 9 | Contact, privacy, 404, SEO, launch checks |

Phases 1–5 need nothing from the client. Phase 6 onward is better with real
answers, but will build against the dummies regardless.

---

## What to chase the family for, in parallel

1. Making-charge and buyback percentages — the pages that differentiate the house
2. Photography — workshop, showroom, 20–30 pieces, a real family portrait
3. Consent from everyone named in `content/client/10-people.json`
4. The founder's story in his own words
5. Real timeline years, hours, parking, GSTIN, exact map coordinates
6. Legal review of the privacy policy against the DPDP Act, 2023
7. Domain and Google Business Profile access

The Google Business Profile is a two-hour job and will move "jewellers in Malviya
Nagar" faster than anything in this repo. Do it this week, in parallel.
