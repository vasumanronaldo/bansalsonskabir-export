#!/usr/bin/env bash
# One-command deploy of Bansal Sons into a FRESH Cloudflare account from a clean
# clone. Idempotent: safe to re-run. Fails loudly and never continues past an error.
#
#   ./scripts/setup.sh
#
# Names default to the spec; override for a scratch/test deploy so you never
# clobber a live worker:
#   WORKER_NAME=bansal-sons-test D1_NAME=bansal-sons-test BUCKET_NAME=bansal-sons-media-test ./scripts/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

WR="npx --yes wrangler"
WORKER_NAME="${WORKER_NAME:-bansal-sons}"
D1_NAME="${D1_NAME:-bansal-sons}"
BUCKET_NAME="${BUCKET_NAME:-bansal-sons-media}"

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die()  { printf '\n\033[31mFAILED: %s\033[0m\n' "$*" >&2; exit 1; }

# Preflight -------------------------------------------------------------------
command -v node >/dev/null || die "node not found (need Node 20+)"
[ -f data/snapshot.sql ] || die "data/snapshot.sql missing — run scripts/export-snapshot.sh first, or clone with data/ committed"

# (a) Confirm the account ------------------------------------------------------
step "Cloudflare account"
$WR whoami | sed 's/^/    /' || die "wrangler not authenticated — run: npx wrangler login"
printf '\n    Worker: %s   D1: %s   R2: %s\n' "$WORKER_NAME" "$D1_NAME" "$BUCKET_NAME"
read -r -p "    Deploy into THIS account with these names? (y/n) " ans
[ "$ans" = "y" ] || die "aborted by user"

# (b) D1 + R2, and write the D1 id into wrangler.jsonc ------------------------
step "D1 database '$D1_NAME'"
if $WR d1 info "$D1_NAME" >/dev/null 2>&1; then
  echo "    exists"
else
  echo "    creating…"
  $WR d1 create "$D1_NAME" >/dev/null || die "d1 create failed"
fi
D1_ID=$($WR d1 info "$D1_NAME" --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);process.stdout.write(j.uuid||j.database_id||"")}')
[ -n "$D1_ID" ] || die "could not read D1 id"
echo "    id: $D1_ID"

step "R2 bucket '$BUCKET_NAME'"
if $WR r2 bucket info "$BUCKET_NAME" >/dev/null 2>&1; then
  echo "    exists"
else
  echo "    creating…"
  $WR r2 bucket create "$BUCKET_NAME" >/dev/null || die "r2 bucket create failed"
fi

step "Writing wrangler.jsonc"
node scripts/patch-wrangler.mjs "$WORKER_NAME" "$D1_NAME" "$D1_ID" "$BUCKET_NAME" || die "patch-wrangler failed"

# (c) Schema -------------------------------------------------------------------
step "Applying schema (schema.sql, then schema-v2.sql)"
$WR d1 execute "$D1_NAME" --remote --file admin/schema.sql --yes    || die "schema.sql failed"
$WR d1 execute "$D1_NAME" --remote --file admin/schema-v2.sql --yes || die "schema-v2.sql failed"

# (d) Import content (idempotent: clear the content tables first, FK-safe order)
step "Importing content snapshot"
CLEAR="DELETE FROM journal_posts; DELETE FROM timeline_events; DELETE FROM process_steps; DELETE FROM people; DELETE FROM images; DELETE FROM pieces; DELETE FROM collections; DELETE FROM faqs; DELETE FROM page_blocks; DELETE FROM documents; DELETE FROM redirects; DELETE FROM settings;"
$WR d1 execute "$D1_NAME" --remote --command "$CLEAR" --yes >/dev/null || die "clear-before-import failed"
$WR d1 execute "$D1_NAME" --remote --file data/snapshot.sql --yes || die "snapshot import failed"
echo "    imported $(grep -c 'INSERT INTO' data/snapshot.sql) rows"

# (e) Upload media to R2, preserving keys --------------------------------------
step "Uploading media to R2"
if [ -d data/media ] && [ -n "$(find data/media -type f -print -quit 2>/dev/null)" ]; then
  total=$(find data/media -type f | wc -l | tr -d ' '); i=0
  while IFS= read -r f; do
    i=$((i+1)); key="${f#data/media/}"
    printf '    [%d/%d] %s\n' "$i" "$total" "$key"
    $WR r2 object put "$BUCKET_NAME/$key" --file "$f" --remote >/dev/null || die "r2 put failed: $key"
  done < <(find data/media -type f)
else
  echo "    (no media in data/media — skipping)"
fi

# (f) Secrets ------------------------------------------------------------------
# Set AFTER first deploy would also work, but generating now and setting after the
# worker exists (below) is the reliable order on a brand-new worker.
GEN_PEPPER=$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))')
GEN_PREVIEW=$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))')
read -r -p $'\n    RESEND_API_KEY (blank to skip email sending): ' RESEND_KEY || true

# (g) Owner account ------------------------------------------------------------
step "Owner account"
read -r -p "    Owner email: " OWNER_EMAIL
read -r -p "    Owner name:  " OWNER_NAME
[ -n "$OWNER_EMAIL" ] && [ -n "$OWNER_NAME" ] || die "owner email and name are required"
ADMIN_DB="$D1_NAME" node scripts/admin-user-add.mjs "$OWNER_EMAIL" "$OWNER_NAME" --owner --remote-only \
  || die "owner seed failed (does the email already exist?)"

# (h) Build, deploy, then secrets, then smoke test -----------------------------
step "Building (OpenNext) and deploying"
pnpm cf:build || die "cf:build failed"
$WR deploy 2>&1 | tee /tmp/bsj-deploy.log
URL=$(grep -oE 'https://[a-z0-9.-]+\.workers\.dev' /tmp/bsj-deploy.log | head -1)
[ -n "$URL" ] || die "could not determine workers.dev URL from deploy output"

step "Setting secrets on the deployed worker"
printf '%s' "$GEN_PEPPER"  | $WR secret put SESSION_PEPPER  || die "secret put SESSION_PEPPER failed"
printf '%s' "$GEN_PREVIEW" | $WR secret put PREVIEW_SECRET  || die "secret put PREVIEW_SECRET failed"
if [ -n "${RESEND_KEY:-}" ]; then
  printf '%s' "$RESEND_KEY" | $WR secret put RESEND_API_KEY || die "secret put RESEND_API_KEY failed"
  echo "    RESEND_API_KEY set"
else
  echo "    RESEND_API_KEY skipped (appointment/newsletter emails will not send until set)"
fi

# One published piece URL for the smoke test.
PIECE_PATH=$($WR d1 execute "$D1_NAME" --remote --json --command \
  "SELECT c.slug AS c, p.slug AS p FROM pieces p JOIN collections c ON c.id=p.collection_id WHERE p.published=1 AND p.deleted_at IS NULL LIMIT 1" 2>/dev/null \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s)[0]?.results?.[0];process.stdout.write(r?`/collections/${r.c}/${r.p}`:"")}')

step "Smoke test → $URL"
pass=0; fail=0
check() { # <path> <expected-code> [must-contain]
  local path="$1" want="$2" needle="${3:-}"
  local body code
  body=$(curl -s -w $'\n%{http_code}' "$URL$path") || { echo "    FAIL $path (curl error)"; fail=$((fail+1)); return; }
  code=$(printf '%s' "$body" | tail -1)
  if [ "$code" != "$want" ]; then echo "    FAIL $path → $code (want $want)"; fail=$((fail+1)); return; fi
  if [ -n "$needle" ] && ! printf '%s' "$body" | grep -q "$needle"; then
    echo "    FAIL $path → $code but missing '$needle'"; fail=$((fail+1)); return
  fi
  echo "    PASS $path → $code${needle:+ (contains '$needle')}"; pass=$((pass+1))
}
check "/" 200
check "/collections" 200
[ -n "$PIECE_PATH" ] && check "$PIECE_PATH" 200
check "/journal" 200
check "/admin" 302
check "/admin/api/pieces" 401
robots=$(curl -s "$URL/robots.txt"); if printf '%s' "$robots" | grep -qi 'Disallow: /admin'; then echo "    PASS robots.txt disallows /admin"; pass=$((pass+1)); else echo "    FAIL robots.txt missing /admin disallow"; fail=$((fail+1)); fi
sm=$(curl -s "$URL/sitemap.xml"); if printf '%s' "$sm" | grep -q '/admin'; then echo "    FAIL sitemap contains /admin"; fail=$((fail+1)); else echo "    PASS sitemap has no /admin"; pass=$((pass+1)); fi

echo
if [ "$fail" -eq 0 ]; then
  printf '\033[32m✓ Live at %s — %d checks passed.\033[0m\n' "$URL" "$pass"
  echo "  Sign in at $URL/admin as $OWNER_EMAIL with the one-time password printed above."
else
  die "$fail smoke check(s) failed (see above). Site deployed but not healthy."
fi
