# Deploying Bansal Sons

This repository is self-contained. A developer who has never seen it can clone it
and have the full site — catalogue, journal, images, admin portal — running in a
**new Cloudflare account in about 30 minutes**, most of which is waiting on builds.

The site is a Next.js app deployed to Cloudflare Workers via OpenNext, backed by
Cloudflare **D1** (content) and **R2** (images). A committed snapshot in `data/`
carries the content and media, so a fresh deploy is fully populated.

---

## Prerequisites

- **Node 20+** and **pnpm** (`npm i -g pnpm`)
- **Wrangler** (bundled as a dev dependency — no global install needed)
- A **Cloudflare account** with Workers, D1 and R2 enabled (the free plan is fine
  to start; R2 requires adding a card but has a free tier)
- Authenticate once: `npx wrangler login`

---

## Deploy

```bash
git clone <repo-url> bansal-sons
cd bansal-sons
pnpm install
./scripts/setup.sh
```

`setup.sh` is **idempotent** (safe to re-run) and stops loudly on any error. It:

1. Prints the Cloudflare account it is about to use and asks you to confirm
   (`y/n`) — so you cannot deploy into the wrong account by accident.
2. Creates the D1 database **`bansal-sons`** and R2 bucket **`bansal-sons-media`**
   if they don't exist, and writes the D1 id into `wrangler.jsonc`.
3. Applies the schema (`admin/schema.sql`, then `admin/schema-v2.sql`).
4. Imports the content snapshot (`data/snapshot.sql`).
5. Uploads every image in `data/media/` to R2, preserving keys.
6. Generates `SESSION_PEPPER` and `PREVIEW_SECRET` randomly, and prompts for
   `RESEND_API_KEY` (press Enter to skip — the site works, but appointment and
   newsletter emails won't send until you set it later).
7. Prompts for the **owner's email and name**, seeds the account, and prints a
   **one-time password once**. Save it — it is not recoverable (give it by phone,
   not email; the owner is forced to change it on first sign-in).
8. Builds, deploys, sets the secrets, and runs a smoke test — printing
   **PASS/FAIL per route**. A green line with the live `*.workers.dev` URL means
   you're done.

Sign in at `‹your-url›/admin` with the owner email and the one-time password.

### Deploying a test copy (without touching a live site)

The names above are the defaults. To stand up a throwaway copy alongside an
existing deploy, override them so nothing is clobbered:

```bash
WORKER_NAME=bansal-sons-test D1_NAME=bansal-sons-test BUCKET_NAME=bansal-sons-media-test ./scripts/setup.sh
```

Tear it down with `npx wrangler delete --name bansal-sons-test`, plus
`npx wrangler d1 delete bansal-sons-test` and
`npx wrangler r2 bucket delete bansal-sons-media-test`.

---

## Custom domain

Once the `*.workers.dev` URL is healthy:

1. Add your domain to Cloudflare (Dashboard → **Add a site**) and point its
   nameservers as instructed. Wait for it to go **Active**.
2. **Workers & Pages → `bansal-sons` → Settings → Domains & Routes → Add custom
   domain** → enter e.g. `bansalsonsjewellers.com` (and `www`). Cloudflare issues
   the certificate automatically.
3. Set the public URL so canonical links, the sitemap and OG images use the real
   host:
   - In `wrangler.jsonc`, add to `"vars"`:
     `"NEXT_PUBLIC_SITE_URL": "https://bansalsonsjewellers.com"`
   - Redeploy: `pnpm cf:build && npx wrangler deploy`
4. Verify `https://your-domain/` loads and `https://your-domain/sitemap.xml`
   shows the real host.

---

## Updating the snapshot (from an existing live account)

To refresh the committed content/media from a running deployment (e.g. before
cloning it elsewhere):

```bash
./scripts/export-snapshot.sh   # writes data/snapshot.sql + data/media/
git add data && git commit -m "chore: refresh content snapshot"
```

It exports the content tables and every referenced R2 object. It deliberately
**excludes** `users`, `sessions`, `login_attempts` (auth is created fresh) and
`enquiries`, `subscribers`, `audit_log` (customer data / history — a clone starts
with an empty inbox).

---

## Day-to-day commands

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server (Next.js) |
| `pnpm cf:build && npx wrangler deploy` | Build + deploy to Cloudflare |
| `pnpm lint` / `pnpm typecheck` | Checks |
| `ADMIN_DB=bansal-sons node scripts/admin-user-add.mjs <email> "<name>" --owner --remote-only` | Add another admin |
| `ADMIN_DB=bansal-sons node scripts/admin-user-reset.mjs <email>` | Reset a password / clear 2FA |

---

## Troubleshooting

- **`wrangler not authenticated`** → `npx wrangler login`.
- **Wrong account** → answer `n` at the confirmation, then
  `npx wrangler logout && npx wrangler login` into the right one.
- **R2 errors on create** → enable R2 in the dashboard once (adds a card); re-run
  `setup.sh` (idempotent).
- **Admin login fails after deploy** → `SESSION_PEPPER` isn't set; re-run
  `setup.sh`, or `printf '%s' "$(openssl rand -base64 32)" | npx wrangler secret put SESSION_PEPPER`.
- **Images 404** → media didn't upload; re-run `setup.sh` (the upload step is
  idempotent and re-puts every key).
