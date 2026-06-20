# Production domain — Healthy Spine (hivandanoc)

| Setting | Value |
|---------|-------|
| **Primary domain** | https://healthyspinedoc.com |
| **WWW** | https://www.healthyspinedoc.com |
| **Server IP** | 173.212.240.38 |
| **Deploy path** | `/var/www/hivandanoc` |

## DNS (Contabo / registrar)

Point these A records to `173.212.240.38`:

```
healthyspinedoc.com       A  173.212.240.38
www.healthyspinedoc.com   A  173.212.240.38
```

Optional subdomains (future):

```
admin.healthyspinedoc.com A  173.212.240.38
api.healthyspinedoc.com   A  173.212.240.38
```

## Deploy

```powershell
# One-time deploy
.\DEPLOY.bat

# Auto-deploy on file save
.\AUTO-DEPLOY.bat

# Upload .env after editing secrets
python deploy\push-env.py
```

## SSL (Let's Encrypt)

Already configured on server for `healthyspinedoc.com` + `www`. To renew or re-issue:

```bash
ssh root@173.212.240.38
certbot --nginx -d healthyspinedoc.com -d www.healthyspinedoc.com --non-interactive --agree-tos -m info@healthyspinedoc.com --redirect
```

## Where domain is stored in code

- `.env` → `PUBLIC_SITE_URL`, `ADMIN_SITE_URL`, `API_SITE_URL`
- `js/seo.js` → `baseUrl`
- `sitemap.xml`, `robots.txt`
- `js/cms-config.js`, `js/api-config.js`, `admin-cms/js/config.js`
- `deploy/nginx-production.conf`
