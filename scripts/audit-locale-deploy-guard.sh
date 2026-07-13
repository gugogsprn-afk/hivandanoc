#!/usr/bin/env bash
# Fail if locale SSR regressions are reintroduced in server code.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

if rg -n "buildPublicContent\\('hy'\\)" server/services server/routes 2>/dev/null; then
  echo "FAIL: hardcoded buildPublicContent('hy') found"
  fail=1
fi

if rg -n "serveConditionsHub\\(\\)" server/routes server/services 2>/dev/null; then
  echo "FAIL: serveConditionsHub() without lang parameter"
  fail=1
fi

if rg -n "serveKnowledgeHub\\(\\)" server/routes server/services 2>/dev/null; then
  echo "FAIL: serveKnowledgeHub() without lang parameter"
  fail=1
fi

if rg -n "serveServicesHub\\(\\)" server/routes server/services 2>/dev/null; then
  echo "FAIL: serveServicesHub() without lang parameter"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "OK: locale deploy guard passed"
