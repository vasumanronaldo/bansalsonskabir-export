#!/usr/bin/env bash
# Export the CURRENT Cloudflare account's D1 content + R2 media into data/, so a
# fresh clone can rebuild the whole site in a new account (see scripts/setup.sh).
#
# Deliberately NOT exported:
#   users, sessions, login_attempts  — auth is created fresh in the new account
#   enquiries, subscribers           — customer PII; a clone starts with an empty inbox
#   audit_log                        — internal history, not content
#
# Run from the repo root:  ./scripts/export-snapshot.sh
set -euo pipefail
cd "$(dirname "$0")/.."

WR="npx --yes wrangler"
SRC_DB="${SRC_DB:-bansal-sons-admin}"       # current account's D1 database name
SRC_BUCKET="${SRC_BUCKET:-bansal-sons-images}" # current account's R2 bucket name

# Content/catalogue tables that travel with the template.
TABLES=(collections documents faqs images journal_posts page_blocks people pieces process_steps redirects settings timeline_events)

echo "==> Export from account:"
$WR whoami | sed 's/^/    /'
echo

mkdir -p data/media

# 1) D1 content (data only — schema comes from admin/schema*.sql on import).
echo "==> Exporting D1 data (${#TABLES[@]} tables) → data/snapshot.sql"
TABLE_FLAGS=()
for t in "${TABLES[@]}"; do TABLE_FLAGS+=(--table "$t"); done
$WR d1 export "$SRC_DB" --remote --no-schema "${TABLE_FLAGS[@]}" --output data/snapshot.sql
echo "    wrote data/snapshot.sql ($(grep -c 'INSERT INTO' data/snapshot.sql) INSERT rows)"

# 2) R2 media. Every object is referenced by the images table, so that is the
#    authoritative key list (no r2 list API needed).
echo "==> Enumerating R2 keys from the images table"
$WR d1 execute "$SRC_DB" --remote --json --command \
  "SELECT r2_key AS k FROM images WHERE deleted_at IS NULL AND r2_key IS NOT NULL
   UNION SELECT r2_key_640 FROM images WHERE deleted_at IS NULL AND r2_key_640 IS NOT NULL" \
  > /tmp/bsj-r2keys.json
node -e 'const j=require("/tmp/bsj-r2keys.json");const r=(j[0]?.results)||[];process.stdout.write(r.map(x=>x.k).join("\n"))' > /tmp/bsj-r2keys.txt
COUNT=$(grep -c . /tmp/bsj-r2keys.txt || true)
echo "    $COUNT objects to fetch"

i=0
while IFS= read -r key; do
  [ -z "$key" ] && continue
  i=$((i+1))
  dest="data/media/$key"
  mkdir -p "$(dirname "$dest")"
  if [ -f "$dest" ]; then
    printf '    [%d/%d] %s (cached)\n' "$i" "$COUNT" "$key"
  else
    printf '    [%d/%d] %s\n' "$i" "$COUNT" "$key"
    $WR r2 object get "$SRC_BUCKET/$key" --file "$dest" --remote >/dev/null
  fi
done < /tmp/bsj-r2keys.txt

SIZE=$(du -sh data/media | cut -f1)
echo
echo "==> Done. data/snapshot.sql + data/media/ ($SIZE, $COUNT objects)"
echo "    Review, then commit data/. If media > 50MB, see .gitattributes (Git LFS)."
