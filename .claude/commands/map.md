---
description: Build or refresh docs/FILEMAP.md — run once, reuse forever
---
Produce `docs/FILEMAP.md`: a lookup table so no future session has to search the
repo. Do this with shell commands, not by reading files.

1. `git ls-files 'src/**' 'app/**' 'components/**' 'lib/**' | head -200`
2. For each public route, one line: route → the file that renders it.
3. For each named section in `docs/04-pages.md`, one line: section → component file.
4. `grep -rln "content/client" src app lib components 2>/dev/null` → list which
   files read client content, and through what function.
5. List every shared component in `components/` with a one-line purpose.

Output format — nothing else, no prose:

```
## Routes
/                     app/page.tsx
/collections/[slug]   app/collections/[slug]/page.tsx

## Sections
Home / Five proofs    components/blocks/ProofRow.tsx
Home / Bansal Standard components/blocks/StandardManifesto.tsx

## Content readers
lib/client-content.ts  → getPieces, getCollections, getSettings
components/blocks/X.tsx → getSettings

## Shared
components/ui/ButtonGhost.tsx   the only button style
```

Then commit it. Do not read the contents of the files beyond what these commands
return.
