# Developer guide — team collaboration

Repository: **https://github.com/gugogsprn-afk/hivandanoc**

## Invite other programmers (repo owner)

1. Open https://github.com/gugogsprn-afk/hivandanoc/settings/access
2. Click **Add people** → enter their GitHub username or email
3. Role: **Write** (can push code) or **Maintain** (can manage settings)

## Clone and run locally

```bash
git clone https://github.com/gugogsprn-afk/hivandanoc.git
cd hivandanoc
cp .env.example .env
# Edit .env — passwords, SMTP, etc. (never commit .env)
npm ci
npm run cms:init
npm start
```

- Site: http://127.0.0.1:8765/
- Admin: http://127.0.0.1:8765/admin-cms/

## Git workflow (all developers)

```bash
git pull --rebase origin main   # always pull before starting work
# … edit files …
git add <files>
git commit -m "Describe why you changed this"
git push origin main
```

For larger changes, use a branch and pull request:

```bash
git checkout -b feature/my-change
git push -u origin feature/my-change
# Open PR on GitHub → review → merge to main
```

## What is NOT in Git (by design)

| Ignored | Why |
|---------|-----|
| `.env` | Secrets (passwords, SMTP, JWT) |
| `data/cms/` | Local database and uploads |
| `node_modules/` | Installed packages |

Each developer copies `.env.example` → `.env`. Production secrets are synced separately (`bash deploy/push-env.sh`).

## Production deploy (after merge to `main`)

```bash
bash deploy/deploy.sh
```

CMS data on the server lives in **`/var/lib/hivandanoc-cms/`** (database, uploads, backups) — not wiped by deploy.

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run cms:backup` | Backup DB + JSON snapshot |
| `npm run cms:reconcile` | Re-link upload files to media library |
| `npm run cms:sync-lang` | Sync HY/RU/EN translations from `lang/*.json` |
| `bash deploy/push-env.sh` | Update production `.env` and staff passwords |

## Branches

- **`main`** — production-ready code; deploy from here
- Feature branches — optional, for review before merge
