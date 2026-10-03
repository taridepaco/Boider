#!/usr/bin/env bash
# Copies the public files of Boider to $DEST (default /opt/boider) and replaces
# every "?v=dev" in index.html with a short hash of the referenced file, so that
# Cloudflare's 4 h cache of JS/CSS never mixes old assets with a new page.
#
#   sudo deploy/install.sh            # from the repo root
#   DEST=/tmp/boider deploy/install.sh   # dry run anywhere
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${DEST:-/opt/boider}"
OWNER="${OWNER:-boider}"
FILES=(index.html style.css params.js grid.js boid.js obstacle.js render.js ui.js)

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

for f in "${FILES[@]}"; do
    cp "$SRC/$f" "$STAGE/$f"
done

for f in "${FILES[@]}"; do
    [ "$f" = index.html ] && continue
    hash="$(sha256sum "$STAGE/$f" | cut -c1-10)"
    sed -i "s|\"$f?v=dev\"|\"$f?v=$hash\"|" "$STAGE/index.html"
done

if grep -q '?v=dev' "$STAGE/index.html"; then
    echo "error: some ?v=dev left in index.html (file missing from FILES?)" >&2
    exit 1
fi

mkdir -p "$DEST"
# replace the contents atomically enough for a static site: copy, then delete stale files
cp "$STAGE"/* "$DEST"/
for existing in "$DEST"/*; do
    name="$(basename "$existing")"
    [[ " ${FILES[*]} " == *" $name "* ]] || rm -rf "$existing"
done

# readable by the service user only (the unit runs with UMask=0077)
if id "$OWNER" >/dev/null 2>&1; then
    chown -R "root:$OWNER" "$DEST"
    chmod 750 "$DEST"
    chmod 640 "$DEST"/*
fi

echo "Installed ${#FILES[@]} files in $DEST:"
grep -o '[a-z]*\.\(js\|css\)?v=[0-9a-f]*' "$DEST/index.html"
