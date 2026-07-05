#!/usr/bin/env bash
# Push master to GitHub (origin) and deploy to production server.
# Usage:
#   bash deploy/publish.sh                    # push + deploy (requires clean commit)
#   bash deploy/publish.sh "Your commit msg"  # commit all, push, deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-master}"
CANONICAL_EMAIL="info@healthyspine.am"

verify_contact_before_deploy() {
  local src=""
  if [[ -f .contact-sync.env ]]; then
    src=".contact-sync.env"
  elif [[ -f .env ]] && grep -q '^CONTACT_EMAIL=' .env; then
    src=".env"
  else
    echo "==> No local CONTACT_EMAIL source; server .contact-sync.env will be preserved"
    return 0
  fi
  if ! grep -q "^CONTACT_EMAIL=${CANONICAL_EMAIL}$" "$src"; then
    echo "ABORT: canonical CONTACT_EMAIL missing/stale in $src"
    grep '^CONTACT_EMAIL=' "$src" || true
    exit 1
  fi
  if grep -q 'spinemedicalclinic@gmail.com' "$src"; then
    echo "ABORT: forbidden stale email in $src"
    exit 1
  fi
  echo "==> Contact env OK ($src → $CANONICAL_EMAIL)"
}

if [[ "${1:-}" != "" ]]; then
  git add -A
  if git diff --cached --quiet; then
    echo "==> Nothing to commit"
  else
    git -c user.name="${GIT_AUTHOR_NAME:-gagpoghosyan99}" \
        -c user.email="${GIT_AUTHOR_EMAIL:-gagpoghosyan99@users.noreply.github.com}" \
        commit -m "$1"
  fi
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Uncommitted changes remain. Commit first or pass a message:"
  echo "  bash deploy/publish.sh \"Describe your change\""
  exit 1
fi

verify_contact_before_deploy

echo "==> Pushing $BRANCH to $REMOTE"
git -c http.postBuffer=524288000 push -u "$REMOTE" "$BRANCH"

echo "==> Deploying to server"
bash "$ROOT/deploy/deploy.sh"

echo "==> Done — code is on GitHub and live on healthyspinedoc.com"
