#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"
package_dir="view/wasm/stars_pkg"

wasm-pack build crates/stars \
  --target web \
  --out-dir "../../$package_dir" \
  --release

# wasm-pack drops a `.gitignore` containing `*` in its output directory. The
# generated package is committed so the frontend artifact image stays
# Node-only, so remove it.
rm -f "$package_dir/.gitignore"

"$repo_root/scripts/check-artifacts.sh" write wasm
