---
description: Build one section of docs/09-changes-v1.md
---
Argument: a section letter (A–H), e.g. `/change D`.

1. Read `docs/FILEMAP.md`. If it does not exist, run `/map` first and stop.
2. Read ONLY that one section's rows in `docs/09-changes-v1.md`. Do not read the
   whole file. Do not read `docs/04-pages.md` unless a row tells you to.
3. From FILEMAP, name the exact files you will edit. State them before editing.
4. Read only those files. Edit them.
5. Copy comes from `content/client/` via the existing content reader. Never paste
   copy out of the change doc into a component. Never rewrite the client's words.
6. Skip anything still open in section X. Note it; do not build it.
7. `pnpm build` → `/qa` → commit `feat(changes): section {letter}` → report in
   under 8 lines → STOP.

Do not build a second section. Do not read ahead.
