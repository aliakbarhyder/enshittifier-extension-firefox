#!/usr/bin/env bash
# Build a Firefox-compatible extension bundle containing only the runtime files
# the extension actually needs at install time. Output goes to
# dist/enshittifier-extension-<version>.zip.
set -euo pipefail

cd "$(dirname "$0")"

VERSION=$(node -p "require('./manifest.json').version" 2>/dev/null \
  || python3 -c "import json; print(json.load(open('manifest.json'))['version'])")

OUT_DIR="dist"
ZIP="$OUT_DIR/enshittifier-extension-$VERSION.zip"

mkdir -p "$OUT_DIR"
rm -f "$ZIP"

# Whitelist of files that ship to end users. Anything not in this list
# stays out of the bundle (test pages, build scripts, repo metadata, etc).
FILES=(
  manifest.json
  background.js
  content.js
  popup.html
  popup.css
  popup.js
  options.html
  options.css
  options.js
  LICENSE
  icons/icon16.png
  icons/icon48.png
  icons/icon128.png
  icons/icon16-disabled.png
  icons/icon48-disabled.png
  icons/icon128-disabled.png
)

# Verify each file exists before zipping — fail loudly if not.
for f in "${FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "missing: $f" >&2
    exit 1
  fi
done

zip -q "$ZIP" "${FILES[@]}"

SIZE=$(du -h "$ZIP" | cut -f1)
COUNT=$(unzip -l "$ZIP" | tail -1 | awk '{print $2}')
echo "wrote $ZIP ($SIZE, $COUNT files)"
