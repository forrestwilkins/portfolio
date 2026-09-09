#!/usr/bin/env bash
set -euo pipefail

# Deploys a branch to the VPS. The remote end is pinned to one script by the
# deploy key, so this can only ever trigger a deploy.
#
#   scripts/deploy.sh              # current branch
#   scripts/deploy.sh main
#
# Host comes from PORTFOLIO_DEPLOY_HOST, or the ssh config alias below.

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

host="${PORTFOLIO_DEPLOY_HOST:-portfolio-deploy}"
branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"

# The VPS builds from committed artifacts, so stale ones would deploy old code
# while looking like a success.
echo "==> checking artifacts"
./scripts/check-artifacts.sh

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash before deploying." >&2
  git status --short >&2
  exit 1
fi

# The VPS pulls from origin, so anything unpushed simply would not ship
if ! git diff --quiet "$branch" "origin/$branch" 2>/dev/null; then
  echo "$branch differs from origin/$branch. Push first." >&2
  exit 1
fi

echo "==> deploying $branch to $host"
ssh "$host" "$branch"
