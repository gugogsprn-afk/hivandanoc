# Phase F — Multilingual Authority Certification

**Date:** 2026-07-06  
**Starting commit:** `55d9d63`  
**Production baseline commit:** _(see git log after F8)_

---

## A) Executive Verdict

**AUTHORITY_CERTIFICATION_PASS**

Phase F certifies that live multilingual authority content meets depth thresholds and that audit tooling now reports accurate word counts aligned with live SSR output.

---

## B) Starting Baseline

- Commit `55d9d63` — Phase E content depth complete
- Authority landings live at 154–183% vs HY; audit JSON incorrectly showed ~35%
- Root cause: regex `extractCrawlBlock` stopped at first nested `</section>` inside `#seo-crawl-content`

---

## C) Audit Extraction Fix

**File:** `scripts/content-parity-audit.js`

**Before (broken regex):**
```javascript
html.match(/<(?:section|article)[^>]*id="seo-crawl-content"[^>]*>([\s\S]*?)<\/(?:section|article)>/i)
```
Non-greedy match closed on first nested `</section>`, truncating ~80% of authority body content.

**After (balanced tag scanner):**
- `stripNonContent()` — removes script/style/noscript/svg
- `extractBalancedFromIndex()` — depth-counts matching open/close tags
- `extractMainText()` — selector priority: `#seo-crawl-content` → `main` → `[data-page-content]` → `.page-content` → `.content` → `body-fallback`
- Per-page metadata: `extractionMethod`, `extractionWarning`
- Exported helpers for certification scripts
- `require.main === module` guard so imports do not re-run audit

**Example — `/spine-specialist-yerevan` RU:**

| Metric | Before | After |
| --- | --- | --- |
| Audit word count | 120 | 923 |
| RU/HY % | 35% | 156% |
| Extraction method | truncated regex | `#seo-crawl-content` |

---

## D) Live vs Audit Certification

See `reports/phase-f-live-authority-certification.md`

All 8 target pages: **audit/live delta 0pp** (within 15pp tolerance). Certification script: `scripts/certify-live-authority-depth.js`

---

## E) Authority Landing Certification Table

| URL | HY | RU | EN | RU % | EN % | Audit RU % | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/spine-specialist-yerevan` | 591 | 923 | 977 | 156% | 165% | 156% | PASS |
| `/back-pain-treatment-yerevan` | 489 | 765 | 865 | 156% | 177% | 156% | PASS |
| `/neck-pain-treatment-yerevan` | 450 | 735 | 802 | 163% | 178% | 163% | PASS |
| `/sciatica-treatment-yerevan` | 489 | 727 | 833 | 149% | 170% | 149% | PASS |
| `/herniated-disc-treatment-yerevan` | 473 | 728 | 835 | 154% | 177% | 154% | PASS |
| `/orthopedic-consultation-yerevan` | 486 | 824 | 863 | 170% | 178% | 170% | PASS |

Target ≥75% RU/EN vs HY: **all PASS**

---

## F) Policy Page Certification Table

| URL | HY | RU | EN | RU % | EN % | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `/editorial-policy` | 509 | 615 | 596 | 121% | 117% | PASS |
| `/medical-review-policy` | 337 | 522 | 505 | 155% | 150% | PASS |

Target ≥80% RU/EN vs HY: **all PASS**

---

## G) Locale / URL / SSR Validation

| Check | Result |
| --- | --- |
| `node --check` | PASS |
| `npm run locale:guard` | PASS |
| `npm run url:audit` | PASS (0 critical/high/medium/low) |
| `npm run content:audit` | PASS (corrected counts) |
| `audit-locale-parity.js` | FULL_LOCALE_PARITY_PASS |
| Post-restart HTTP 200 | `/`, `/spine-specialist-yerevan?lang=ru`, `?lang=en` |

---

## H) Schema / JSON-LD Validation

See `reports/phase-f-schema-authority-audit.md`

- 27 page/locale checks (8 routes + patient-consultation-guide × 3 langs)
- All JSON-LD blocks parseable
- FAQPage present where FAQ visible (RU/EN policy pages)
- BreadcrumbList present on all checks
- Canonical + `html lang` correct
- **Overall: PASS** (0 issue rows)

---

## I) Medical Safety Validation

Scanned `server/services`, `lang`, public content for problematic claims. Matches found only in safe negations («we do not guarantee», «не публикуем гарантии»). No public problematic claims requiring fix.

---

## J) Language Leakage Validation

Node-based Armenian script check on RU/EN body text (`extractMainText`) for 9 authority/policy paths: **0 leaks**.

---

## K) Files Changed

| File | Change |
| --- | --- |
| `scripts/content-parity-audit.js` | Balanced extraction, metadata, exports |
| `scripts/certify-live-authority-depth.js` | New — live vs audit certification |
| `scripts/audit-authority-schema.js` | New — JSON-LD QA |
| `server/services/authority-landing-depth.js` | RU typo fixes |
| `reports/content-parity-*.md/json` | Regenerated with correct counts |
| `reports/phase-f-*.md` | Certification artifacts |

---

## L) Known Non-blocking Issues

1. **`npm run seo:audit`** — 108 pre-existing failures (not introduced by Phase E/F); not remediated per scope
2. **`Консерватив реабилитация`** in `authority-landing-specs.js` (pre-Phase-E file) — not changed in F scope
3. Brief **502** after `pm2 restart` (~2s) — resolved on retry

---

## M) Production Baseline Verdict

**AUTHORITY_CERTIFICATION_PASS**

Certified production authority baseline:
- Live depth thresholds met (landings ≥75%, policy ≥80%)
- Audit tooling aligned with live SSR
- Locale, URL, content audits PASS
- No Armenian leakage in RU/EN body
- No medical compliance regressions
- No routing/locale/sitemap/CMS changes

---

## N) Next Recommended Maintenance Phase

**Phase G — Audit tooling & SEO hygiene (optional):**
1. Add `certify-live-authority-depth.js` to CI post-deploy
2. Fix remaining 108 `seo:audit` items incrementally (non-blocking)
3. Align `authority-landing-specs.js` RU adjective forms with depth module
4. Consider hreflang audit expansion for new authority routes
