const { ui, normalizeLang } = require('./i18n-ssr');
const { KNOWLEDGE_CONFIG } = require('./knowledge-config');
const KNOWLEDGE_I18N = require('./knowledge-i18n');
const { getKnowledgeParityOverlay } = require('./knowledge-i18n-parity');
const { missingKnowledgeConfig, logMissingTranslation } = require('./locale-content');

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function findService(data, slug) {
  return (data?.departments || []).find((s) => s.id === slug);
}

function knowledgeConditionLinksHtml(config, lang = 'hy') {
  const { getConditionConfig } = require('./condition-pages');
  lang = normalizeLang(lang);
  const u = ui(lang);
  const slugs = (config.conditionSlugs || []).slice(0, 4);
  if (!slugs.length) return '';
  const items = slugs
    .map((id) => {
      const c = getConditionConfig(id, lang);
      if (!c) return '';
      return `<li><a href="/conditions/${esc(id)}">${esc(c.h1)}</a></li>`;
    })
    .filter(Boolean)
    .join('');
  if (!items) return '';
  return `<section class="seo-service-section"><h2>${esc(u.relatedConditions)}</h2><ul class="hss-list">${items}</ul></section>`;
}

function knowledgeServiceLinksHtml(data, config, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const slugs = (config.serviceSlugs || []).slice(0, 4);
  if (!slugs.length) return '';
  const items = slugs
    .map((id) => {
      const s = findService(data, id);
      if (!s) return '';
      return `<li><a href="/services/${esc(id)}">${esc(s.name)}</a></li>`;
    })
    .filter(Boolean)
    .join('');
  if (!items) return '';
  const intro =
    lang === 'ru'
      ? 'Следующие услуги могут рассматриваться только после оценки специалиста.'
      : lang === 'en'
        ? 'The following services may be considered only after specialist assessment.'
        : 'Հետևյալ ծառայությունները կարող են դիտարկվել միայն մասնագետի գնահատումից հետո։';
  return `<section class="seo-service-section"><h2>${esc(u.relatedServices)}</h2><div class="hss-prose"><p>${esc(intro)}</p></div><ul class="hss-list">${items}</ul></section>`;
}

function getKnowledgeTitle(slug, lang) {
  lang = normalizeLang(lang);
  let config;
  if (lang === 'hy') {
    config = KNOWLEDGE_CONFIG[slug];
  } else {
    const overlay = KNOWLEDGE_I18N[lang]?.[slug] || KNOWLEDGE_I18N.en?.[slug];
    if (!overlay) {
      logMissingTranslation('knowledge', slug, lang);
      config = missingKnowledgeConfig(slug, lang);
    } else {
      const parity = getKnowledgeParityOverlay(slug, lang);
      config = parity ? { ...overlay, ...parity } : overlay;
    }
  }
  return config?.h1 || config?.titleSuffix || slug;
}

function knowledgeRelatedArticlesHtml(config, lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const slugs = (config.relatedKnowledgeSlugs || []).slice(0, 6);
  if (!slugs.length) return '';
  const items = slugs
    .map((slug) => {
      const title = getKnowledgeTitle(slug, lang);
      return `<li><a href="/knowledge/${esc(slug)}">${esc(title)}</a></li>`;
    })
    .filter(Boolean)
    .join('');
  if (!items) return '';
  return `<section class="seo-service-section"><h2>${esc(u.relatedArticles)}</h2><ul class="hss-list">${items}</ul></section>`;
}

const CONSULTATION_COPY = {
  hy: {
    text: 'Եթե ախտանիշները պահպանվում են կամ ուժգնանում են, կարող է օգտակար լինել մասնագետի խորհրդատվությունը։',
    heading: 'Երբ դիմել մասնագետ'
  },
  ru: {
    text: 'Если симптомы сохраняются или усиливаются, может быть полезна консультация специалиста.',
    heading: 'Когда обратиться к специалисту'
  },
  en: {
    text: 'If symptoms persist or become more severe, a specialist consultation may be helpful.',
    heading: 'When to see a specialist'
  }
};

function knowledgeConsultationPathHtml(lang = 'hy') {
  lang = normalizeLang(lang);
  const u = ui(lang);
  const copy = CONSULTATION_COPY[lang] || CONSULTATION_COPY.hy;
  const appointmentLabel =
    lang === 'ru' ? 'Записаться на приём' : lang === 'en' ? 'Book an appointment' : u.bookAppointment;
  return `<section class="seo-service-section knowledge-consultation-path">
    <h2>${esc(copy.heading)}</h2>
    <div class="hss-prose"><p>${esc(copy.text)}</p></div>
    <p><a href="/contact" class="hss-link">${esc(u.contact)}</a> · <a href="/find-a-doctor" class="hss-link">${esc(u.findDoctors)}</a> · <a href="/appointment" class="hss-link">${esc(appointmentLabel)}</a></p>
  </section>`;
}

module.exports = {
  knowledgeConditionLinksHtml,
  knowledgeServiceLinksHtml,
  knowledgeRelatedArticlesHtml,
  knowledgeConsultationPathHtml
};
