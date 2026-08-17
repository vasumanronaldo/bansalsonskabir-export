# Admin portal — prompt

Run this **after** the change round in `CHANGE-PROMPT.md` is merged. Fresh
session. Build 10a and 10b first and stop — the auth layer gets its own review.

---

## Session 1 — foundations and auth

```
Build the self-hosted admin portal, phases 10a and 10b only, then stop.

Read docs/10-admin-portal.md and admin/skeleton/routes.md. Read nothing else.

This replaces any third-party CMS. There is no Sanity, no Vercel — the site runs
on Cloudflare Workers with D1 for data and R2 for images. If any older doc says
otherwise it is out of date; docs/10-admin-portal.md governs.

10a — apply admin/schema.sql to D1, bind the R2 bucket in wrangler.toml, write
the admin:migrate and admin:user:add scripts. admin:user:add generates a one-time
password, sets must_change = 1, and prints the password once. Seed one owner
account and confirm login works end to end.

10b — the auth layer. Copy admin/skeleton/auth.ts into src/ and use it as
written. If you need to change anything in it, tell me what and why in the commit
message rather than changing it quietly.

Then wire: login page, POST login with rate limiting, logout, session middleware
on every /admin route, CSRF on every mutation, forced password change when
must_change is 1, ADMIN_HEADERS on every /admin response, and /admin excluded
from both sitemap and robots.

Non-negotiables — I will check each of these:

- Only sha256(token + SESSION_PEPPER) is ever written to the sessions table.
  The raw token exists in the cookie and nowhere else.
- Password and token comparisons use the constant-time helper. Never ===.
- Unknown email and wrong password return the same message and take the same
  time. Call dummyVerify() on the unknown-email path so the timing matches.
- The cookie is HttpOnly, Secure, SameSite=Strict, Path=/, 12 hours.
- No public signup. No email password reset. Accounts come from the CLI only.

Do not build any screen beyond login and the forced password change. Write a
throwaway /admin page that prints the signed-in user's name so I can verify the
session, and nothing more.

When done: run /qa, commit, and give me a short summary plus the exact commands
to add the other three users. Then stop.
```

---

## Session 2 — the piece editor (10c, 10d)

```
Continue the admin portal: phases 10c and 10d.

Read docs/10-admin-portal.md sections 5 and 6 only.

10c — the piece editor. One screen, no tabs. Name, subtitle, collection, and a
plain textarea for the description with a live character count. No rich text
editor: the site renders paragraphs and nobody needs bold.

Save is explicit, never autosave — four people share this login and autosave means
one person's half-finished thought overwrites another's. Send updated_at on load
and reject the save if it has moved, showing who edited it and when, with a reload
option.

Publish is gated: if any image on the piece has empty alt text, the publish button
is disabled and states the reason. Not a warning that can be dismissed.

Preview opens the real piece page with a signed token so an unpublished piece can
be seen without being public. HMAC of the piece id with PREVIEW_SECRET, 30 minute
expiry.

10d — images. Resize in the browser before upload: canvas, long edge to 2400px,
WebP at 0.86 quality. A 6MB phone photo should be about 300KB before it leaves the
room. Generate a 640px variant in the same pass and store both in R2.

The worker validates every upload by magic bytes, not by filename and not by the
client-sent MIME type. 8MB hard cap. Allowlist webp, jpeg, png.

Drag to reorder, click a thumbnail to set the cover, alt text field under each
image, per-file upload progress. Deleting an image soft-deletes the row and
deletes the R2 object.

The editor is the whole product — the family will spend all their time here and
nowhere else in the portal. Everything else can be plain; this cannot.

/qa, commit, stop.
```

---

## Session 3 — the rest (10e, 10f)

```
Finish the admin portal: phases 10e and 10f.

10e — collections (reorder, intro copy), settings (hours, phone, address,
homepage featured selection), enquiries (list, status, note), users (owner only,
cannot disable yourself).

10f — point the public site at D1 through lib/db.ts. Components must not know
whether content came from the database or from content/client/ — export one
getPieces(), getCollections(), getSettings() surface and keep the call sites
unchanged. Cache published queries in the Workers Cache API for 60 seconds,
purged on publish.

Then run admin:seed to import the fifteen pieces from
content/client/05-pieces.json, idempotent by slug. After it has run, D1 is the
source of truth for pieces and collections; leave 05-pieces.json in the repo as a
record and stop editing it.

Write admin:backup — every table except sessions, to backups/YYYY-MM-DD.json.

/qa, commit, and give me a one-page handover I can send the family: how to log in,
how to add a piece, how to upload photographs, how to publish.
```

---

## Before the family uses it

```bash
wrangler secret put SESSION_PEPPER     # 32+ random bytes
wrangler secret put PREVIEW_SECRET
pnpm admin:migrate
pnpm admin:user:add chetan@example.com "Chetan Bansal"
```

Give each person their one-time password **by phone, not email**, and have them
change it on first login. Four accounts, one owner.

## Two things to hold the line on

**No price field, ever** — including in the portal. It is the one rule that would
quietly turn this into a shop, and a database column is exactly how that starts.

**Alt text stays required.** It is the only accessibility rule that will otherwise
never get done, and a blocked publish button is the only mechanism that works.
