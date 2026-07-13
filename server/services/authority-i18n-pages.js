/**
 * Expanded RU/EN body and FAQ for priority authority/local SEO pages.
 */
'use strict';

const { buildLandingPage, buildPolicyPage } = require('./authority-landing-builder');
const { SPECS } = require('./authority-landing-specs');
const { DEPTH, mergeDepth } = require('./authority-landing-depth');
const POLICY_DEPTH = require('./authority-policy-depth');

function buildFromSpec(path, lang) {
  const base = SPECS[path]?.[lang];
  if (!base) return null;
  const depth = DEPTH[path]?.[lang];
  const policyExtra = POLICY_DEPTH[path]?.[lang];
  let merged = mergeDepth(base, depth, lang);
  if (policyExtra) {
    merged = {
      ...merged,
      ...policyExtra,
      sections: policyExtra.sections || merged.sections,
      faq: policyExtra.faq || merged.faq
    };
  }
  const cfg = { lang, ...merged };

  if (merged.sections) {
    const { bodyHtml } = buildPolicyPage(cfg);
    return { tagline: merged.tagline, description: merged.description, bodyHtml, faq: merged.faq };
  }

  const { bodyHtml } = buildLandingPage(cfg);
  return {
    tagline: merged.tagline,
    description: merged.description,
    bodyHtml,
    faq: merged.faq
  };
}

const ru = {};
const en = {};

for (const path of Object.keys(SPECS)) {
  const r = buildFromSpec(path, 'ru');
  const e = buildFromSpec(path, 'en');
  if (r) ru[path] = r;
  if (e) en[path] = e;
}

module.exports = { ru, en };
