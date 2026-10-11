#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

# Each home page background is its own crate and package
for name in stars psychedelic; do
  package_dir="view/wasm/${name}_pkg"

  wasm-pack build "crates/$name" \
    --target web \
    --out-dir "../../$package_dir" \
    --release

  # wasm-pack drops a `.gitignore` containing `*` in its output directory. The
  # generated package is committed so the frontend artifact image stays
  # Node-only, so remove it.
  rm -f "$package_dir/.gitignore"
done

"$repo_root/scripts/check-artifacts.sh" write wasm
