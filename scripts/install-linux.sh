#!/usr/bin/env bash
set -euo pipefail

# Full pipeline installer for Linux (Ubuntu/Debian)
# - optionally runs npm ci if node_modules missing
# - builds frontend and runs Tauri bundle
# - finds the produced .deb and installs it (copies to /tmp to avoid _apt sandbox warning)
# Usage: bash scripts/install-linux.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SEARCH_DIR="$ROOT_DIR/src-tauri/target/release/bundle"

echo "Working dir: $ROOT_DIR"

# Ensure node is available
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found in PATH. Please install Node.js (>=16) and retry." >&2
  exit 2
fi

# If node_modules missing, run npm ci to install deps
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "node_modules not found — running npm ci (this may take a while)..."
  npm ci
fi

echo "Building frontend and Tauri bundle..."
# npm run tauri:build will invoke the frontend build via beforeBuildCommand if configured
npm run tauri:build

echo "Searching for .deb files under: $SEARCH_DIR"
DEB=$(find "$SEARCH_DIR" -type f -name '*.deb' 2>/dev/null | head -n 1 || true)

if [ -z "$DEB" ]; then
  echo "No .deb found under $SEARCH_DIR" >&2
  exit 3
fi

echo "Found .deb: $DEB"

# Copy to /tmp to avoid _apt sandbox permission warnings
TMP_DEST="/tmp/$(basename "$DEB")"
echo "Copying to $TMP_DEST and installing..."
cp -f "$DEB" "$TMP_DEST"

sudo apt update || true
sudo apt install -y "$TMP_DEST"

echo "Installation finished. You can run the app with: patients"
echo "Temporary copy: $TMP_DEST (remove if you want: rm -f '$TMP_DEST')"

exit 0
