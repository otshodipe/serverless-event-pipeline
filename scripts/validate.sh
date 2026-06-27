#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "==> Running Node handler tests"
node --test

if [ -x "./node_modules/.bin/serverless" ]; then
  echo "==> Packaging Serverless service"
  npx serverless package
else
  echo "==> Skipping 'serverless package' because dependencies are not installed"
fi
