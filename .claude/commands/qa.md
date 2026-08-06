---
description: Run the brand and quality gate over the current diff
---
Review `git diff` (staged and unstaged) against these gates. Report only failures.

BRAND
- Any occurrence of "35 years", "35+", or any figure other than 33 / "three decades"
- Any price, currency symbol, or the words: buy, shop, cart, sale, offer, discount, deal
- "The House of Bansal" used anywhere structural (logo, nav, <title>, schema, contact)
- Superlatives with no fact behind them (exquisite, unparalleled, breathtaking, luxurious)
- A list of abstract values instead of a demonstrated fact
- Client names or faces without `consentOnFile`

DESIGN
- More than 3 gold elements in one viewport
- Any border-radius > 0, any box-shadow, any gradient
- A filled primary button (only ButtonGhost is permitted)
- Forbidden motion: parallax, marquee, counters, sparkle, spring, autoplay carousel
- Framer Motion imported in the root layout rather than lazily per section

CODE
- `pnpm build` — zero TS errors, zero ESLint warnings
- Missing `useReducedMotion` guard on any animated component
- Missing visible focus style on any interactive element
- `next/image` without a `sizes` prop
- A new dependency not listed in CLAUDE.md, section Stack
- Alt text missing or generic

Output a table of: FAIL | file:line | what | fix. If all pass, say "All gates pass."

CLIENT CONTENT
- Any address, phone, opening hour, percentage, piece title or policy figure
  hardcoded in a component instead of read from `content/client/` via
  `lib/client-content.ts`
- `DraftFlag` or `[TK]` styling reachable in a production build
- A new placeholder invented inline instead of added to `content/client/`
- `_approved` flipped to `true` without the client confirming it

FACTS AND IMAGERY
- Founder written as anyone other than "Shri Ashok Kumar Bansal"
- Address other than "C-50 Malviya Nagar", phone other than "+91 85272 92840",
  or email other than "bansalsonsjewellers18@gmail.com"
- A hardcoded year in a copyright notice
- Any AI-generated or stock photograph of a person
- An abstract-value row (Design / Quality / Integrity style) instead of a
  demonstrated fact
- Headings set in caps rather than sentence case
