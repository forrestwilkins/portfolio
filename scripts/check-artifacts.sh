#!/usr/bin/env bash
set -euo pipefail

# Fingerprints the sources that feed each committed build output, so a deploy
# can refuse artifacts that no longer match the code. Mirrors the
# check-*-artifact.sh pair in praxis-live.
#
#   scripts/check-artifacts.sh check [target...]   # fails if stale
#   scripts/check-artifacts.sh write [target...]   # records the fingerprint
#
# Targets: wasm, server, client. Default is all three.

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum; else shasum -a 256; fi
}

fingerprint() {
  find "$@" \
    \( -name node_modules -o -name target -o -name __pycache__ \) -prune -o \
    -type f ! -name .DS_Store ! -name '*.tsbuildinfo' ! -name .source-checksum \
    -print0 \
    | LC_ALL=C sort -z | xargs -0 shasum -a 256 | sha | cut -d ' ' -f 1
}

# Shared build inputs; a change to any of these invalidates every artifact
common=(package.json package-lock.json .npmrc tsconfig.json .dockerignore)

mode="${1:-check}"
case "$mode" in
  check|write) [[ $# -gt 0 ]] && shift ;;
  *) echo "Usage: check-artifacts.sh [check|write] [wasm|server|client ...]" >&2; exit 1 ;;
esac
targets=("$@")
[[ ${#targets[@]} -eq 0 ]] && targets=(wasm server client)

for target in "${targets[@]}"; do
  case "$target" in
    wasm)
      dir="view/wasm/stars_pkg"
      sum="$(fingerprint crates)"
      rebuild="npm run wasm:build"
      ;;
    server)
      dir="deploy/artifacts/server"
      sum="$(fingerprint src tsconfig.src.json eslint.config.js \
              deploy/Dockerfile.backend-artifact "${common[@]}")"
      rebuild="npm run build:server-artifact"
      ;;
    client)
      dir="deploy/artifacts/frontend-dist"
      sum="$(fingerprint view vite.config.ts tsconfig.src.json tsconfig.view.json \
              eslint.config.js deploy/Dockerfile.frontend-artifact "${common[@]}")"
      rebuild="npm run build:client-artifact"
      ;;
    *) echo "Unknown target: $target" >&2; exit 1 ;;
  esac

  file="$dir/.source-checksum"
  if [[ "$mode" == write ]]; then
    mkdir -p "$dir"
    printf '%s\n' "$sum" > "$file"
    echo "recorded $target"
  elif [[ ! -f "$file" || "$(cat "$file")" != "$sum" ]]; then
    echo "The $target artifact is stale or missing. Run: $rebuild" >&2
    exit 1
  fi
done

if [[ "$mode" == check ]]; then
  echo "artifacts up to date: ${targets[*]}"
fi
