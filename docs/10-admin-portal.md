# 10 — Admin portal

Self-hosted. No Sanity, no third-party CMS, no external auth provider. The family
logs in at `/admin`, adds a piece, uploads photographs, writes the description,
publishes. That is the whole product.

**Stack note.** The live site runs on Cloudflare Workers
(`bansal-sons.vasuvij.workers.dev`), not the Next.js/Vercel stack in the original
`docs/03-architecture.md`. This document and the architecture doc are now aligned
to **Cloudflare Workers + D1 + R2**. Anywhere the older doc still says Sanity or
Vercel, this file wins.

---

## 1 — Why build rather than integrate

Thirty to forty pieces, four editors, one content type that matters. A hosted CMS
costs a monthly bill, a second login, a schema that lives somewhere else, and an
export problem if it is ever retired. At this scale the build is smaller than the
integration, and everything stays inside one Cloudflare account the family
already owns.

The trade is real and worth stating: **we own the auth.** Get section 4 right.

## 2 — What the portal manages, and what it does not

| Managed in the portal | Stays in `content/client/` |
|---|---|
| Pieces — name, subtitle, collection, description, order, published | The founder's story |
| Photographs — upload, reorder, alt text, set cover | The timeline |
| Collections — title, order, intro copy | The eight process steps |
| Homepage featured selection | Pricing, aftercare, commission terms |
| Opening hours, phone, address | Privacy policy, FAQ |
| Appointment enquiries — read, mark contacted | The Bansal Standard |

The rule: **things that change monthly go in the portal; things that change once
a year stay in files.** Putting the privacy policy behind a login helps nobody and
adds a screen the family will never open.

## 3 — Data model (D1)

Full DDL in `admin/schema.sql`. Shape:

```
users            id, email, name, password_hash, password_salt, role,
                 created_at, last_login_at, disabled
sessions         id (sha256 of token), user_id, created_at, expires_at,
                 ip, user_agent
login_attempts   id, identifier, ip, at, ok          -- rate limiting
collections      id, slug, title, intro, sort_order, published
pieces           id, slug, name, subtitle, collection_id, description,
                 sort_order, featured, published, created_at, updated_at,
                 created_by, updated_by
images           id, piece_id, r2_key, width, height, alt, sort_order,
                 is_cover, bytes, created_at
settings         key, value                          -- json blobs, one row per group
enquiries        id, name, phone, email, preferred_date, preferred_time,
                 occasion, interest, budget, requirement, contact_method,
                 status, submitted_at, note
audit_log        id, user_id, action, entity, entity_id, detail, at
```

Notes that matter:

- **No price column anywhere.** Same rule as before. If someone asks for one,
  refuse and cite this line.
- `slug` is generated from `name` on first save, then frozen — changing it later
  breaks links people have been sent. Offer an explicit "change URL" action that
  writes a redirect row rather than silently editing.
- `published` defaults to `0`. Nothing appears on the live site until someone
  ticks it.
- Deletes are soft where they are visible (`pieces`, `images` get `deleted_at`),
  hard where they are not (`sessions`, `login_attempts`).
- `audit_log` is append-only. Four people share this login surface; being able to
  answer "who unpublished Ratneshvari" is worth one table.

## 4 — Authentication

This is the part that must not be improvised.

**Passwords.** PBKDF2-SHA256, 600,000 iterations, 16-byte random salt per user,
via WebCrypto — Workers has no native bcrypt or argon2. Store salt and hash
separately. Compare with a constant-time comparison, never `===`.

**No public signup, no password reset by email.** Users are seeded from the
command line:

```bash
pnpm admin:user:add chetan@example.com "Chetan Bansal"
```

The script prints a one-time password and forces a change on first login. Four
accounts, added once. A reset flow is a whole attack surface for a problem that a
phone call solves.

**Sessions.** 32 random bytes, base64url. Store only the **SHA-256 of the token**
in D1 — a database leak must not yield usable sessions. Cookie:

```
Set-Cookie: bsj_session=<token>; HttpOnly; Secure; SameSite=Strict;
            Path=/; Max-Age=43200
```

Twelve hours. Rotate the token on login. Delete the row on logout.

**Rate limiting.** Five failed attempts per identifier and per IP in fifteen
minutes, then locked for fifteen. Log every attempt. Return the **same message and
the same timing** for unknown user and wrong password — no user enumeration.

**CSRF.** Every mutating request carries a token from the session, submitted as a
header and compared server-side. `SameSite=Strict` covers most of it; the token
covers the rest.

**Headers**, on every `/admin` response:

```
Cache-Control: no-store
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:;
```

`/admin/*` is `noindex, nofollow` and excluded from `sitemap.ts`.

**Roles.** `owner` can manage users; `editor` can do everything else. That is the
entire permission model and it is enough for four people.

## 5 — Images

No third-party image service. R2 plus a browser-side resize.

**Upload flow**

1. Browser reads the file, draws it to a `<canvas>`, resizes so the long edge is
   at most **2400px**, exports **WebP at quality 0.86**. A 6MB phone photo becomes
   roughly 300KB before it ever leaves the room.
2. `POST /admin/api/images` with the blob. The worker validates: magic bytes are
   a real image, `Content-Length` under **8MB**, MIME on the allowlist
   (`image/webp`, `image/jpeg`, `image/png`). Never trust the filename.
3. Store at `pieces/{piece_id}/{uuid}.webp` in R2. Record dimensions and bytes.
4. Serve from `/img/{key}` through the worker with
   `Cache-Control: public, max-age=31536000, immutable`. The key contains a UUID,
   so it is safe to cache forever.

**Also generate a 640px variant** at upload time, same canvas pass, stored as
`{uuid}@640.webp`. Two sizes cover the whole site: 640 for grid cards, 2400 for
piece pages. Emit both in `srcset`.

**Alt text is required** before a piece can be published. Not a nag — a blocked
publish button with the reason shown. It is the one accessibility rule that will
otherwise never get done.

## 6 — Screens

```
/admin/login              Email, password. Nothing else on the page.
/admin                    Dashboard: unpublished drafts, new enquiries, recent edits
/admin/pieces             List: cover thumb, name, collection, published, updated
/admin/pieces/new         Create
/admin/pieces/:id         Edit: details, images, publish toggle, preview link
/admin/collections        Reorder, edit intro copy
/admin/enquiries          Appointment requests, mark contacted, add a note
/admin/settings           Hours, phone, address, homepage featured selection
/admin/users              Owner only
```

**The piece editor is the product.** Everything else can be plain. It should be
one screen, no tabs:

- Name, subtitle, collection, description — description is a plain textarea with
  a live character count, not a rich-text editor. The site renders paragraphs.
  Nobody needs bold.
- A drag-to-reorder image strip. Click a thumbnail to set the cover. Alt text
  field under each.
- Drag-and-drop upload zone that accepts multiple files and shows per-file
  progress.
- A sticky footer bar: **Save draft** · **Preview** · **Publish**. Save is
  explicit, not autosave — autosave on a shared login means one person's
  half-thought overwrites another's.
- Preview opens `/collections/{slug}/{piece}?preview={signed-token}` so an
  unpublished piece renders on the real site without being public.

**Optimistic concurrency.** Load sends `updated_at`; save rejects if it has moved
and shows "Karan edited this two minutes ago" with a reload option. Four editors
on forty pieces will collide eventually.

## 7 — Public site reads

The public site reads D1 directly at the edge. No build step, no webhook, no
revalidation — publishing is live within a cache TTL.

Cache published queries in the Workers Cache API for **60 seconds**, purged on
publish. Cheap, and the site keeps serving if D1 is briefly unavailable.

`content/client/` stays exactly as it is for everything in the right-hand column
of § 2. `lib/client-content.ts` keeps its current shape; a parallel `lib/db.ts`
handles portal-managed content. **Components should not know which is which** —
export one `getPieces()`, `getCollections()`, `getSettings()` surface.

## 8 — Migration

The fifteen pieces in `content/client/05-pieces.json` seed the database:

```bash
pnpm admin:seed
```

Idempotent, matched on slug. After it runs once, D1 is the source of truth for
pieces and collections, and `05-pieces.json` becomes a historical record — leave
it in the repo, stop editing it.

## 9 — Backups

D1 has time-travel restore, but a family business should hold its own copy:

```bash
pnpm admin:backup    # writes backups/YYYY-MM-DD.json — all tables except sessions
```

Run it monthly. It is forty pieces of text; the whole thing is a small file.

## 10 — What this deliberately does not have

Versioning and rollback, scheduled publishing, multi-language, a media library
separate from pieces, roles beyond owner and editor, email notifications, a rich
text editor, 2FA.

Every one of those is defensible and every one is a screen the family will not
use. If a real need appears, add it then. **2FA is the only one worth revisiting**
— if the portal ever manages anything more sensitive than piece descriptions, add
TOTP before adding anything else.
