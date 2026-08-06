#!/usr/bin/env bash
# pnpm content:edit founder   → opens content/client/01-founder.md in $EDITOR
set -euo pipefail
DIR="content/client"
[ $# -eq 0 ] && { echo "usage: pnpm content:edit <name>"; ls -1 "$DIR" | sed 's/^/  /'; exit 1; }
MATCH=$(ls -1 "$DIR" | grep -i -- "$1" | head -n1 || true)
[ -z "$MATCH" ] && { echo "no file matching '$1'"; ls -1 "$DIR" | sed 's/^/  /'; exit 1; }
"${EDITOR:-vi}" "$DIR/$MATCH"
