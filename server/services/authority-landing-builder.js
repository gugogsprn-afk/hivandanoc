'use strict';

/**
 * Builds long-form RU/EN authority landing bodyHtml + FAQ for local SEO pages.
 */
function ctaLinks(lang) {
  if (lang === 'ru') {
    return `<p><a href="/appointment" class="hss-link">Записаться на приём</a> · <a href="/find-a-doctor" class="hss-link">Найти врача</a> · <a href="/contact" class="hss-link">Контакты</a></p>`;
  }
  return `<p><a href="/appointment" class="hss-link">Book an appointment</a> · <a href="/find-a-doctor" class="hss-link">Find a doctor</a> · <a href="/contact" class="hss-link">Contact</a></p>`;
}

function ctaNav(lang) {
  if (lang === 'ru') {
    return `<nav class="seo-service-cta" aria-label="Next steps"><p><a href="/appointment" class="hss-btn hss-btn--primary">Записаться на консультацию</a> <a href="/find-a-doctor" class="hss-btn hss-btn--outline">Найти врача</a></p></nav>`;
  }
  return `<nav class="seo-service-cta" aria-label="Next steps"><p><a href="/appointment" class="hss-btn hss-btn--primary">Book a consultation</a> <a href="/find-a-doctor" class="hss-btn hss-btn--outline">Find a doctor</a></p></nav>`;
}

function list(items) {
  return items.map((i) => `<li>${i}</li>`).join('');
}

function proseSection(title, p) {
  if (!p) return '';
  return `<section class="seo-service-section"><h2>${title}</h2><div class="hss-prose"><p>${p}</p></div></section>`;
}

function bulletSection(title, bullets) {
  if (!bullets?.length) return '';
  return `<section class="seo-service-section"><h2>${title}</h2><ul class="hss-list">${list(bullets)}</ul></section>`;
}

function linkSection(block) {
  if (!block) return '';
  const links = (block.links || [])
    .map((l) => `<li><a href="${l.href}" class="hss-link">${l.label}</a></li>`)
    .join('');
  return (
    `<section class="seo-service-section"><h2>${block.title}</h2>` +
    (block.p ? `<div class="hss-prose"><p>${block.p}</p></div>` : '') +
    (links ? `<ul class="hss-list">${links}</ul>` : '') +
    `</section>`
  );
}

function footerLinks(blocks) {
  if (!blocks?.length) return '';
  const links = blocks.map((l) => `<a href="${l.href}" class="hss-link">${l.label}</a>`).join(' · ');
  return `<p>${links}</p>`;
}

function buildLandingPage(cfg) {
  const lang = cfg.lang;
  const symptomsBlock =
    cfg.symptomsTitle && cfg.symptoms?.length
      ? bulletSection(cfg.symptomsTitle, cfg.symptoms)
      : '';
  const extraBlocks = (cfg.extraSections || [])
    .map(
      (s) =>
        `<section class="seo-service-section"><h2>${s.title}</h2>` +
        (s.p ? `<div class="hss-prose"><p>${s.p}</p></div>` : '') +
        (s.bullets?.length ? `<ul class="hss-list">${list(s.bullets)}</ul>` : '') +
        `</section>`
    )
    .join('');

  const bodyHtml =
    `<div class="hss-prose"><p>${cfg.intro1}</p><p>${cfg.intro2}</p>` +
    (cfg.intro3 ? `<p>${cfg.intro3}</p>` : '') +
    `</div>` +
    symptomsBlock +
    bulletSection(cfg.whenHelpTitle, cfg.whenHelp) +
    (cfg.causes?.title
      ? `<section class="seo-service-section"><h2>${cfg.causes.title}</h2>` +
        (cfg.causes.p ? `<div class="hss-prose"><p>${cfg.causes.p}</p></div>` : '') +
        (cfg.causes.bullets?.length ? `<ul class="hss-list">${list(cfg.causes.bullets)}</ul>` : '') +
        `</section>`
      : '') +
    proseSection(cfg.expectConsult?.title, cfg.expectConsult?.p) +
    `<section class="seo-service-section"><h2>${cfg.assessmentTitle}</h2><div class="hss-prose"><p>${cfg.assessment}</p></div></section>` +
    (cfg.methods?.p
      ? `<section class="seo-service-section"><h2>${cfg.methods.title}</h2><div class="hss-prose"><p>${cfg.methods.p}</p></div>` +
        (cfg.methods.bullets?.length ? `<ul class="hss-list">${list(cfg.methods.bullets)}</ul>` : '') +
        `</section>`
      : '') +
    `<section class="seo-service-section"><h2>${cfg.rehabTitle}</h2><div class="hss-prose"><p>${cfg.rehab}</p></div>` +
    (cfg.rehabBullets?.length ? `<ul class="hss-list">${list(cfg.rehabBullets)}</ul>` : '') +
    `</section>` +
    (cfg.recovery?.p
      ? `<section class="seo-service-section"><h2>${cfg.recovery.title}</h2><div class="hss-prose"><p>${cfg.recovery.p}</p></div>` +
        (cfg.recovery.bullets?.length ? `<ul class="hss-list">${list(cfg.recovery.bullets)}</ul>` : '') +
        `</section>`
      : '') +
    proseSection(cfg.prevention?.title, cfg.prevention?.p) +
    bulletSection(cfg.urgent?.title, cfg.urgent?.bullets) +
    bulletSection(cfg.evaluatedConditions?.title, cfg.evaluatedConditions?.bullets) +
    linkSection(cfg.relatedConditions) +
    linkSection(cfg.relatedServices) +
    extraBlocks +
    (cfg.trustContact?.p
      ? `<section class="seo-service-section"><h2>${cfg.trustContact.title}</h2><div class="hss-prose"><p>${cfg.trustContact.p}</p></div>` +
        (cfg.trustContact.bullets?.length ? `<ul class="hss-list">${list(cfg.trustContact.bullets)}</ul>` : '') +
        `</section>`
      : `<section class="seo-service-section"><h2>${cfg.trustTitle}</h2><ul class="hss-list">${list(cfg.trustBullets)}</ul></section>`) +
    `<section class="seo-service-section"><h2>${cfg.bookTitle}</h2><ul class="hss-list">${list(cfg.bookBullets)}</ul>${ctaLinks(lang)}</section>` +
    footerLinks(cfg.footerLinks) +
    ctaNav(lang);

  return { bodyHtml, faq: cfg.faq };
}

function buildPolicyPage(cfg) {
  const bodyHtml =
    `<div class="hss-prose"><p>${cfg.intro1}</p><p>${cfg.intro2}</p>` +
    (cfg.intro3 ? `<p>${cfg.intro3}</p>` : '') +
    `</div>` +
    cfg.sections
      .map(
        (s) =>
          `<section class="seo-service-section"><h2>${s.title}</h2>` +
          (s.p ? `<div class="hss-prose"><p>${s.p}</p></div>` : '') +
          (s.bullets?.length ? `<ul class="hss-list">${list(s.bullets)}</ul>` : '') +
          `</section>`
      )
      .join('') +
    ctaLinks(cfg.lang);
  return { bodyHtml, faq: cfg.faq };
}

module.exports = { buildLandingPage, buildPolicyPage, ctaLinks, ctaNav };
