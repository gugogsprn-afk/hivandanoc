# Deployment — Healthy Spine (hivandanoc)

**Production domain:** https://healthyspinedoc.com  
**Production server:** `173.212.240.38`

## Live URLs

| URL | Status |
|-----|--------|
| https://healthyspinedoc.com/ | ✅ Primary site |
| https://www.healthyspinedoc.com/ | ✅ WWW redirect |
| http://173.212.240.38/ | ✅ IP fallback |
| https://healthyspinedoc.com/api/health | ✅ API health |

## Quick deploy (Windows)

```powershell
.\DEPLOY.bat
.\AUTO-DEPLOY.bat   # watch files and auto-deploy
```

## Quick deploy (Mac/Linux)

```bash
./deploy/deploy.sh
```

## Environment variables

```bash
PUBLIC_SITE_URL=https://healthyspinedoc.com
DEPLOY_HOST=173.212.240.38
python deploy/deploy.py
python deploy/push-env.py
```

See also: `DOMAIN.md`
