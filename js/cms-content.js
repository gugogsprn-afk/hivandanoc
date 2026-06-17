/**
 * Fetch dynamic CMS content for the public website.
 */
const CmsContent = (function () {
  let cache = null;
  let cacheLang = null;
  let cacheTime = 0;
  const TTL = 0;

  async function fetchContent(lang) {
    const code = lang || (typeof I18n !== 'undefined' ? I18n.getLang() : 'hy');
    const now = Date.now();
    if (cache && cacheLang === code && now - cacheTime < TTL) {
      return cache;
    }

    const base = CmsConfig.apiBase();
    try {
      const res = await fetch(`${base}/public/content?lang=${code}&_=${Date.now()}`, {
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`CMS ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error('CMS unavailable');

      cache = data;
      cacheLang = code;
      cacheTime = now;
      return data;
    } catch (err) {
      console.warn('[CmsContent]', err.message);
      return null;
    }
  }

  function applyCmsPresentation(cms) {
    if (!cms) return;
    if (cms.i18nOverrides && typeof I18n !== 'undefined' && I18n.setOverrides) {
      I18n.setOverrides(cms.i18nOverrides);
      I18n.applyDOM();
    }
    if (typeof HospitalApp !== 'undefined' && HospitalApp.applyCmsVisuals) {
      HospitalApp.applyCmsVisuals(cms);
    }
  }

  function mergeIntoHospital(baseData, cms) {
    if (!cms || !baseData) return baseData;

    const merged = { ...baseData };
    if (cms.hospital) {
      merged.hospital = { ...merged.hospital, ...cms.hospital };
    }
    if (cms.departments?.length) merged.departments = cms.departments;
    if (cms.doctors?.length) merged.doctors = cms.doctors;
    if (cms.serviceCategories?.length) merged.serviceCategories = cms.serviceCategories;
    if (cms.testimonials?.length) merged.reviews = cms.testimonials;

    const extraKeys = [
      'trustPoints', 'conditions', 'equipment', 'programs', 'advantages',
      'introParagraphs', 'feature', 'approachParagraphs', 'expertsParagraphs',
      'imagingParagraphs', 'approachImage', 'expertsImage', 'imagingImage',
      'news', 'storyVideos', 'patientStories', 'patientHero',
      'backInGame', 'expertiseOverlay', 'awards', 'reviews', 'moveBetter', 'timeSlots',
      'pageImages', 'inlineText', 'elementStyles', 'pageFields'
    ];
    for (const key of extraKeys) {
      if (cms[key]) merged[key] = cms[key];
    }
    if (cms.pageFields) merged.pageFields = cms.pageFields;

    merged._cms = {
      homeSections: cms.homeSections || {},
      seo: cms.seo || {},
      i18nOverrides: cms.i18nOverrides || {}
    };
    applyCmsPresentation(cms);
    return merged;
  }

  function invalidate() {
    cache = null;
    cacheLang = null;
    cacheTime = 0;
  }

  let watchedVersion = 0;
  let watchTimer = null;

  function startVersionWatch(intervalMs = 30000) {
    if (watchTimer || typeof window === 'undefined') return;
    const base = CmsConfig.apiBase();

    async function tick() {
      try {
        const res = await fetch(`${base}/public/version?_=${Date.now()}`, {
          headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
        });
        if (!res.ok) return;
        const data = await res.json();
        const v = Number(data.version) || 0;
        if (watchedVersion && v > watchedVersion) {
          invalidate();
          if (typeof HospitalApp !== 'undefined' && HospitalApp.reloadFromCms) {
            await HospitalApp.reloadFromCms();
          }
        }
        watchedVersion = v;
      } catch {
        /* ignore */
      }
    }

    tick();
    watchTimer = setInterval(tick, intervalMs);
  }

  return { fetchContent, mergeIntoHospital, invalidate, startVersionWatch };
})();
