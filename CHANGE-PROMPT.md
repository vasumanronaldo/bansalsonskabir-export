# Change round v1 — prompt

Start a **fresh Claude Code session** (`/clear` first if one is open), then paste
the block below.

---

```
The site is built. This is a revision round from the client's own review of the
live build, dated 15 August 2026.

Read docs/09-changes-v1.md in full. That file governs this entire round — where
it conflicts with docs/04-pages.md, it wins, and you update 04-pages.md to match
in the same commit so the spec never drifts from the site.

All new copy already lives in content/client/. It has been rewritten for you.
Read it from there through lib/client-content.ts. Do not paste copy from the
change doc into components, and do not rewrite the client's wording — it is
approved text in their voice, and improving it is not the job this round.

Work in this order, committing after each group:

  1. Section A — Home
  2. Section G, H — Footer and Appointment (small, mechanical)
  3. Section B — Legacy
  4. Section C — Craftsmanship
  5. Section E — Maison
  6. Section F — Bespoke
  7. Section D — Collections. Largest change. Do this last.

Section D removes the maker's dossier from piece pages. Delete the spec-row
record component and its data path cleanly — do not leave it commented out or
conditionally rendered. Piece pages become: name, subtitle, prose, photographs.
Nothing else. Fifteen named pieces are in content/client/05-pieces.json.

Four things I want you to get exactly right, because they are the ones that will
go wrong:

- Section X of the change doc has three items marked RESOLVED (X1, X2, X4) —
  build those exactly as written there. X1 in particular is a wording change that
  has to be applied everywhere; grep for it. The remaining X items are still open:
  skip them, leave the existing content, and list them back to me at the end.

- The bespoke lead time changes from three to five months to two to four weeks.
  Change it everywhere it appears, not just the hero. Grep for it.

- The Bansal Standard loses its last three lines and keeps six. It is still the
  signature section — do not let it lose weight in the layout because it got
  shorter. Re-check the spacing.

- Remove the BSJ reference codes from the homepage grid and from piece pages.
  They were part of the dossier system that is being removed.

Everything else in docs/CLAUDE.md still applies unchanged: no prices, no cart,
1993 not 35 years, facts only from content/client/, gold capped at three elements
per viewport, no AI-generated or stock photographs of people.

When you are done: run /qa, update docs/04-pages.md to match, commit, and give me
a summary under fifteen lines that ends with the list of blocked items you
skipped. Do not start anything new after that.
```

---

## If you'd rather go section by section

Larger rounds are easier to review in pieces. One section per session:

```
Read docs/09-changes-v1.md section D only, plus content/client/04-collections.json
and 05-pieces.json. Build that section. Skip anything listed in section X.
Then /qa, commit, and stop.
```

## After the round

```bash
pnpm content:status
```

Two files stay draft on purpose: `07-aftercare.md` (missing turnaround figures)
and `11-commission-terms.md` (two unanswered sections). They will keep failing
`pnpm check:launch` until answered — which is correct.

## The seven things to take back to the family

1. **Mumbai or Malviya Nagar?** The timeline says manufacturing moved to a Mumbai
   facility in 1999; three places on the site say every piece is made in the room
   they are standing in. Decide the wording once and it applies everywhere.
2. **The five turnaround figures.** Currently "— working days" with no number.
3. **Is Rajeev a son or a nephew?** The two documents disagree.
4. **Which ring goes in which category** — there are two ring collections and four
   unassigned rings.
5. **Cancellation after casting**, and **the remake standard if a piece is wrong.**
   Both were specced, neither was answered.
6. **The Instagram handle** — the instruction ended without one.
7. **The dossier.** Worth one conversation before it goes for good. See X7.
