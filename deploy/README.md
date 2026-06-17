# Deployment — Healthy Spine (hivandanoc)

**Production server:** `173.212.240.38` (`ssh healthyspine`)

## Live URLs

| URL | Status |
|-----|--------|
| http://173.212.240.38/ | ✅ Live |
| https://healthyspine.am/ | ⏳ Pending DNS |

## PM2

**Not required.** This is a static HTML/CSS/JS site served directly by nginx. No Node.js process needed.

## Quick deploy (from project root)

```bash
./deploy/deploy.sh
```

## First-time server setup

Already done on `173.212.240.38`. For a fresh VPS:

```bash
ssh root@YOUR_SERVER 'bash -s' < deploy/server-setup.sh
./deploy/deploy.sh
```

## Enable HTTPS (Let's Encrypt)

1. Point DNS A records to `173.212.240.38`:
   - `healthyspine.am`
   - `www.healthyspine.am`

2. Run:

```bash
./deploy/ssl.sh
```

Or manually:

```bash
ssh healthyspine "certbot --nginx -d healthyspine.am -d www.healthyspine.am --non-interactive --agree-tos -m info@healthyspine.am --redirect"
```

3. Update `js/seo.js` `baseUrl` to `https://healthyspine.am` and redeploy.

## Files

| Script | Purpose |
|--------|---------|
| `deploy/deploy.sh` | Rsync + reload nginx |
| `deploy/ssl.sh` | Let's Encrypt after DNS |
| `deploy/server-setup.sh` | One-time VPS provisioning |
| `deploy/nginx-production.conf` | Production nginx vhost (port 80) |
| `deploy/nginx-hivandanoc.conf` | Legacy port 8088 config (old server) |

## Environment variables

```bash
DEPLOY_SERVER=root@173.212.240.38 ./deploy/deploy.sh
DEPLOY_DOMAIN=healthyspine.am DEPLOY_EMAIL=info@healthyspine.am ./deploy/ssl.sh
```
