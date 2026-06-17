#!/usr/bin/env bash
# Enable Let's Encrypt SSL (requires DNS A record → 173.212.240.38)
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@173.212.240.38}"
DOMAIN="${DEPLOY_DOMAIN:-healthyspine.am}"
EMAIL="${DEPLOY_EMAIL:-info@healthyspine.am}"

echo "==> Checking DNS for $DOMAIN"
IP=$(dig +short "$DOMAIN" A | head -1)
if [ "$IP" != "173.212.240.38" ]; then
  echo "ERROR: $DOMAIN does not point to 173.212.240.38 (got: ${IP:-none})"
  echo "Add DNS A record: $DOMAIN → 173.212.240.38"
  exit 1
fi

echo "==> Requesting certificate via certbot"
ssh "$SERVER" "certbot --nginx -d $DOMAIN -d www.$DOMAIN \
  --non-interactive --agree-tos -m $EMAIL --redirect"

echo "==> SSL enabled: https://$DOMAIN/"
