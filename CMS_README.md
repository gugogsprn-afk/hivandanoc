# Healthy Spine CMS

Full content management system for **healthyspinedoc.com**.

| Subdomain | Purpose |
|-----------|---------|
| `healthyspinedoc.com` | Public website (static HTML + CMS API) |
| `admin.healthyspinedoc.com` | Admin panel (`admin-cms/`) |
| `api.healthyspinedoc.com` | Backend API (Node.js + SQLite) |

Until DNS is configured, use:
- Site: `http://173.212.240.38/`
- Admin: `http://173.212.240.38/admin-cms/`
- API: `http://173.212.240.38/api/v1/public/content`

---

## First-time setup

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET, CMS_ADMIN_PASSWORD, SMTP, etc.

npm install
npm run cms:seed    # Import hospital.json + create admin user
npm start           # http://127.0.0.1:8765
```

**Default admin** (change immediately in `.env` before seeding):
- Email: `admin@healthyspinedoc.com`
- Password: value of `CMS_ADMIN_PASSWORD` in `.env`

Open admin: http://127.0.0.1:8765/admin-cms/

---

## Phase 1 modules (implemented)

| Module | Admin | API |
|--------|-------|-----|
| Login + JWT auth | ✅ | `POST /api/v1/auth/login` |
| Dashboard stats | ✅ | `GET /api/v1/admin/dashboard/stats` |
| Global settings | ✅ | `PUT /api/v1/admin/settings/global` |
| Homepage sections | ✅ | `GET/PUT /api/v1/admin/homepage` |
| Doctors CRUD | ✅ | `GET/POST/PUT/DELETE /api/v1/admin/doctors` |
| Services CRUD | ✅ | `GET/POST/PUT/DELETE /api/v1/admin/services` |
| Media upload | ✅ | `POST /api/v1/admin/media/upload` |
| Leads / appointments | ✅ | `GET/PATCH /api/v1/admin/leads` |
| Public content API | — | `GET /api/v1/public/content?lang=hy` |
| Form → leads | — | `POST /api/v1/public/leads/appointment` |

## Phase 2 (planned)

About page editor, blog, testimonials admin, contact page editor, user roles UI, activity log viewer, automatic sitemap from DB.

---

## Database

SQLite file: `data/cms/cms.db` (gitignored)  
Uploads: `data/cms/uploads/`

Tables: `users`, `settings`, `media`, `doctors`, `services`, `service_categories`, `page_sections`, `leads`, `contact_messages`, `blog_posts`, `testimonials`, `activity_logs`

---

## Security

- JWT authentication (`JWT_SECRET` required in production)
- Roles: `super_admin`, `manager`, `receptionist`
- Rate limiting on login and public forms
- File upload validation (images + mp4/webm, max 10 MB)
- Activity logging for admin actions
- Admin panel: `noindex`, separate subdomain recommended

---

## Production deploy

```bash
./deploy/deploy.sh
```

On server, switch nginx to subdomain config:

```bash
cp /var/www/hivandanoc/deploy/nginx-cms-subdomains.conf /etc/nginx/sites-available/hivandanoc
nginx -t && systemctl reload nginx
```

DNS records (all → `173.212.240.38`):

```
A   healthyspinedoc.com
A   www.healthyspinedoc.com
A   admin.healthyspinedoc.com
A   api.healthyspinedoc.com
```

SSL:

```bash
certbot --nginx -d healthyspinedoc.com -d www.healthyspinedoc.com \
  -d admin.healthyspinedoc.com -d api.healthyspinedoc.com
```

Copy `.env` to server (not in git), then:

```bash
pm2 restart hivandanoc-api
```

---

## How public site gets CMS data

1. `js/cms-config.js` — API URL resolution  
2. `js/cms-content.js` — fetches `/api/v1/public/content`  
3. `js/common.js` — merges CMS data over `hospital.json`  
4. Forms use `/api/v1/public/leads/*` (saved to admin dashboard)

Changes in admin appear on the public site within ~60 seconds (client cache TTL).
