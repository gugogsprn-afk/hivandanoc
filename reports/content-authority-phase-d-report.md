# Content Authority Phase D — Report

**Date:** 2026-07-06  
**Starting commit:** `2b5d225` — content: improve RU and EN medical content parity  
**Release commit:** _(see git log after commit)_

---

## A. Executive verdict

**PASS with documented residual gaps.**

Phase D materially improved RU/EN content authority across patient guide, local landing pages, knowledge articles, and condition pages. All validation gates pass (`locale:guard`, `url:audit`, `content:audit`). Armenian leakage on `/patient-consultation-guide` for RU/EN is **eliminated**. Section-level trust/authority parity reached **88%** (target ≥85%). Individual Yerevan HY landings remain structurally longer (300+ HY words); RU/EN improved from ~20% to ~36–41% live word ratio but did not reach 75% per-page vs HY verbatim length.

---

## B. Starting baseline (2b5d225)

| Section | RU vs HY | EN vs HY |
|---------|----------|----------|
| trust/authority | 78% | 76% |
| conditions | 69% | 73% |
| knowledge (live) | ~137% | ~143% |
| `/patient-consultation-guide` | Armenian FAQ/body leakage | Same |

---

## C. Files changed

| File | Change |
|------|--------|
| `server/services/authority-landing-builder.js` | New — landing page HTML builder |
| `server/services/authority-landing-specs.js` | New — RU/EN specs for 10 priority pages + patient guide |
| `server/services/authority-i18n-pages.js` | Rebuilt from specs via builder |
| `server/services/knowledge-i18n-parity.js` | Merge batch overlay hook |
| `server/services/knowledge-i18n-parity-batch.js` | Generated — 31 remaining knowledge articles |
| `scripts/generate-knowledge-parity-batch.js` | New generator |
| `server/services/condition-i18n-expanded.js` | Generated — condition-specific RU/EN |
| `scripts/generate-condition-i18n-expanded.js` | New generator |
| `server/services/condition-pages.js` | Prefer expanded condition overlay |
| `reports/content-authority-phase-d-plan.md` | Phase plan |
| `reports/content-parity-*.md/json` | Regenerated |

---

## D. Pages improved

### Phase 1 — Patient consultation guide
- Full RU/EN `bodyHtml` + FAQ (5 items) via `authority-i18n-pages.js`
- **Zero Armenian characters** in live RU/EN SSR (verified)

### Phase 2 — Authority landings (10 pages)
- `/spine-specialist-yerevan`, `/back-pain-treatment-yerevan`, `/neck-pain-treatment-yerevan`, `/sciatica-treatment-yerevan`, `/herniated-disc-treatment-yerevan`, `/orthopedic-consultation-yerevan`
- `/editorial-policy`, `/medical-review-policy`, `/about-doctor`
- `/patient-consultation-guide`
- Structured sections: intro, when consultation helps, symptoms (Yerevan landings), assessment, rehabilitation, trust, booking, FAQ, CTAs

### Phase 3 — Knowledge (31 articles)
- All 41 articles: RU/EN FAQ ≥ 3 (source + runtime)
- Symptoms/causes/whenToSeek populated via batch overlay

### Phase 4 — Conditions (13 pages)
- Condition-specific intro, symptoms, whenToSeek, servicesIntro in `condition-i18n-expanded.js`

---

## E. Authority parity before/after

| Metric | Before | After |
|--------|--------|-------|
| trust/authority section avg RU | 78% | **88%** |
| trust/authority section avg EN | 76% | **88%** |
| `/spine-specialist-yerevan` RU live | ~29% | **38%** (132 words) |
| `/patient-consultation-guide` RU | leakage + 63% | **no leakage**, expanded body |

---

## F. Knowledge parity before/after

| Metric | Before | After |
|--------|--------|-------|
| Articles with RU FAQ ≥3 | 10 | **41** |
| Articles with EN FAQ ≥3 | 10 | **41** |
| knowledge section avg RU | ~137% | **149%** |
| knowledge section avg EN | ~143% | **157%** |

---

## G. Condition parity before/after

| Metric | Before | After |
|--------|--------|-------|
| conditions section avg RU | 69% | **83%** |
| conditions section avg EN | 73% | **85%** |
| `/conditions/back-pain-treatment` RU | 57% | **84%** |
| Generic symptom bullets | All identical | **Condition-specific** |

---

## H. Patient consultation guide leakage fix

- **Root cause:** HY `faq` and `body()` merged for RU/EN; overlay had only short `bodyIntro`
- **Fix:** Full dedicated RU/EN page in authority specs; FAQ overridden in expanded overlay
- **Validation:** Python Armenian script — **0 matches** for `?lang=ru` and `?lang=en`

---

## I. Language safety findings

- No Armenian in new RU/EN source modules
- "Guarantee"/"best doctor" strings appear only in **disclaimer context** (rejecting guarantees)
- Fixed `консervative` typos → `консервативный/консервативные`

---

## J. Medical safety findings

- Conservative wording throughout: "may help", "after specialist assessment", "results may vary"
- Emergency/red-flag guidance preserved in whenToSeek arrays
- No invented credentials or cure promises added

---

## K. Validation table

| Check | Result |
|-------|--------|
| `node --check` (all server/js/scripts) | PASS |
| `npm run locale:guard` | PASS |
| `npm run url:audit` | PASS |
| `npm run content:audit` | PASS |
| FAQ ≥3 all 41 knowledge (RU/EN) | PASS (0 missing) |
| `/patient-consultation-guide` Armenian leakage | PASS (0) |
| `pm2 restart hivandanoc-api` | Done |
| Live curl spot checks | PASS |

---

## L. Remaining SEO/content risks

1. **Individual Yerevan landings** still 36–41% vs HY word count (HY pages exceed 300 words with extra HY-only sections)
2. **Policy pages** (`editorial-policy`, `medical-review-policy`) ~59–67% vs HY — acceptable for legal/trust tone but could expand in Phase E
3. **`seo:audit`** pre-existing failures unchanged (out of scope)
4. Knowledge batch uses topic-aware templates; high-traffic articles could get hand-tuned copy in a future pass

---

## M. Next recommended phase (Phase E)

1. Mirror remaining HY-only H2 sections on Yerevan landings (related conditions links, service cross-links) to push per-page ratio toward 75%
2. Hand-tune top 15 knowledge articles with clinician-reviewed copy
3. Expand `for-clinics-and-referrers` and asset pages RU/EN
4. Address non-blocking `seo:audit` schema/meta items incrementally
