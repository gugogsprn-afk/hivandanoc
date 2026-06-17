#!/usr/bin/env bash
# One-time server provisioning (run on fresh Ubuntu VPS)
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx ufw rsync curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs
npm install -g pm2

mkdir -p /var/www/hivandanoc

# Firewall: SSH + HTTP + HTTPS
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

systemctl enable nginx
systemctl start nginx

echo "Server ready. Run deploy/deploy.sh from your Mac."
