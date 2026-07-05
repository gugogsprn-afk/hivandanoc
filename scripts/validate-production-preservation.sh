#!/usr/bin/env bash
# Non-destructive production preservation validator for HealthySpineDoc.
# Usage: bash scripts/validate-production-preservation.sh [BASE_URL]
set -euo pipefail

BASE="${1:-https://healthyspinedoc.com}"
BASE="${BASE%/}"
FAIL=0
PASS=0

ok() { echo "✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ $1"; FAIL=$((FAIL + 1)); }

echo "==> HealthySpineDoc preservation validation"
echo "    Base URL: $BASE"
echo

# Fetch homepage once
HTML="$(curl -fsSL "$BASE/")" || { echo "✗ Cannot fetch $BASE/"; exit 1; }

# Phone
if echo "$HTML" | grep -q '+37493274888'; then
  ok "Phone +37493274888 present on homepage"
else
  fail "Phone +37493274888 missing on homepage"
fi

# Email
if echo "$HTML" | grep -q 'info@healthyspine.am'; then
  ok "Email info@healthyspine.am present on homepage"
else
  fail "Email info@healthyspine.am missing on homepage"
fi

# No CHIC legacy
if echo "$HTML" | grep -qi 'HealthySpineCHIC\|healthyspinechic'; then
  fail "HealthySpineCHIC legacy reference found on homepage"
else
  ok "No HealthySpineCHIC references on homepage"
fi

# Social links
if echo "$HTML" | grep -q '61586936099454'; then
  ok "Canonical Facebook profile referenced"
else
  fail "Canonical Facebook profile missing"
fi

if echo "$HTML" | grep -q 'healthyspine.clinic'; then
  ok "Canonical Instagram handle referenced"
else
  fail "Canonical Instagram handle missing"
fi

# lang attribute
if echo "$HTML" | grep -q 'lang="hy"'; then
  ok 'Homepage lang="hy"'
else
  fail 'Homepage missing lang="hy"'
fi

# Favicon
FAV_CODE="$(curl -sI -o /dev/null -w '%{http_code}' "$BASE/favicon.ico")"
if [[ "$FAV_CODE" == "200" ]]; then
  ok "favicon.ico returns HTTP 200"
else
  fail "favicon.ico returned HTTP $FAV_CODE"
fi

# Sitemap count
SITEMAP="$(curl -fsSL "$BASE/sitemap.xml")" || { fail "Cannot fetch sitemap"; SITEMAP=""; }
if [[ -n "$SITEMAP" ]]; then
  COUNT="$(echo "$SITEMAP" | grep -c '<loc>' || true)"
  if [[ "$COUNT" -eq 93 ]]; then
    ok "Sitemap contains 93 URLs"
  else
    fail "Sitemap URL count expected 93, found $COUNT"
  fi
  for required_loc in \
    'https://healthyspinedoc.com/contact' \
    'https://healthyspinedoc.com/editorial-policy' \
    'https://healthyspinedoc.com/spine-specialist-yerevan'; do
    if echo "$SITEMAP" | grep -qF "$required_loc"; then
      ok "Sitemap includes $required_loc"
    else
      fail "Sitemap missing $required_loc"
    fi
  done
fi

# robots.txt sitemap reference
ROBOTS="$(curl -fsSL "$BASE/robots.txt")" || { fail "Cannot fetch robots.txt"; ROBOTS=""; }
if echo "$ROBOTS" | grep -q 'Sitemap: https://healthyspinedoc.com/sitemap.xml'; then
  ok "robots.txt references sitemap"
else
  fail "robots.txt missing sitemap reference"
fi

# Priority URLs HTTP 200
PRIORITY_PATHS=(
  "/"
  "/contact"
  "/locations"
  "/find-a-doctor"
  "/about"
  "/consultation-process"
  "/services/manual-therapy"
  "/spine-specialist-yerevan"
  "/editorial-policy"
)
for path in "${PRIORITY_PATHS[@]}"; do
  CODE="$(curl -sI -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [[ "$CODE" == "200" ]]; then
    ok "HTTP 200 $path"
  else
    fail "HTTP $CODE $path (expected 200)"
  fi
done

# Contact blocks on SSR pages
CONTACT_HTML="$(curl -fsSL "$BASE/contact")"
if echo "$CONTACT_HTML" | grep -qE 'contact-block|hss-contact-block'; then
  ok "Contact block present on /contact"
else
  fail "Contact block missing on /contact"
fi
if echo "$CONTACT_HTML" | grep -q 'tel:+37493274888'; then
  ok "tel:+37493274888 on /contact"
else
  fail "tel link missing on /contact"
fi

CONSULT_HTML="$(curl -fsSL "$BASE/consultation-process")"
if echo "$CONSULT_HTML" | grep -qE 'contact-block|hss-contact-block'; then
  ok "Contact block present on /consultation-process"
else
  fail "Contact block missing on /consultation-process"
fi

# Admin blocked
ADMIN_CODE="$(curl -sI -o /dev/null -w '%{http_code}' "$BASE/admin/")"
if [[ "$ADMIN_CODE" == "403" ]]; then
  ok "/admin/ returns HTTP 403"
else
  fail "/admin/ returned HTTP $ADMIN_CODE (expected 403)"
fi

# Schema sanity (homepage)
if echo "$HTML" | grep -q 'application/ld+json'; then
  ok "JSON-LD present on homepage"
else
  fail "JSON-LD missing on homepage"
fi

echo
echo "==> Summary: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
