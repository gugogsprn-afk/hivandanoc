# Internal Linking Authority Map

Generated as part of the E-E-A-T authority program (baseline `1a0ba81`).

## Condition pages → outbound links

Each `/conditions/:slug` SSR page now includes:

| Target | Anchor pattern | Count |
|--------|----------------|------:|
| Related services | Service name (localized) | 2–4 from `serviceSlugs` |
| Related knowledge | Article H1 | 2–4 from `getKnowledgeLinksForCondition()` |
| Find a doctor | `findDoctors` UI string | 1 |
| Contact / appointment | CTA block | 1 |
| Conditions hub | Back link | 1 |

## Service pages → outbound links

Each `/services/:slug` SSR page now includes:

| Target | Anchor pattern | Count |
|--------|----------------|------:|
| Related conditions | Condition H1 via `SERVICE_CONDITION_LINKS` | 2–6 |
| Related services | Same-category services | up to 4 |
| Find a doctor | `findDoctors` | 1 |
| Consultation process | CTA secondary | 1 |
| Contact | Primary CTA | 1 |

## Knowledge articles → outbound links

Each `/knowledge/:slug` SSR page footer includes:

- `/services` (services hub)
- `/conditions` (conditions hub)
- `/consultation-process`
- `/find-a-doctor`

## Doctor profiles → outbound links

Each `/doctors/:slug` SSR page includes:

| Target | Source |
|--------|--------|
| Related services | `DOCTOR_SERVICE_MAP` by doctor id |
| Related conditions | `DOCTOR_CONDITION_MAP` with localized H1 |
| Find-a-doctor hub | Breadcrumb + back link |
| Contact / consultation | CTA block |

## Hub pages

| Hub | Key internal links |
|-----|-------------------|
| `/` | Conditions, knowledge, services, consultation, spine specialist |
| `/find-a-doctor` | Profile URLs `/doctors/:slug` |
| `/services` | All launched service slugs |
| `/conditions` | All launched condition slugs + services + knowledge |
| `/knowledge` | All launched article slugs + services + conditions |

## Authority / trust pages

| Page | Links to |
|------|----------|
| `/editorial-policy` | Contact, consultation, knowledge |
| `/consultation-process` | Contact, locations, find-a-doctor |
| `/spine-specialist-yerevan` | Services, conditions, contact |
| `/about` | Contact, find-a-doctor, editorial-policy |

## Sitemap coverage

Doctor profile URLs `/doctors/:slug` are included in `sitemap.xml` for all published CMS doctors.
