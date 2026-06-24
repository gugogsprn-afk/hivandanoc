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

  function mergeLocalizedById(primary, localized) {
    if (!localized?.length) return primary;
    const map = new Map(localized.map((x) => [x.id, x]));
    return (primary || []).map((item) => {
      const tr = map.get(item.id);
      if (!tr) return item;
      return {
        ...item,
        ...tr,
        services: tr.services?.length ? tr.services : item.services
      };
    });
  }

  function mergeIntoHospital(baseData, cms) {
    if (!cms || !baseData) return baseData;

    const lang = typeof I18n !== 'undefined' ? I18n.getLang() : 'hy';
    const locH = typeof I18n !== 'undefined' ? I18n.getContent()?.hospital || {} : {};
    const HOSPITAL_TEXT = ['name', 'shortName', 'tagline', 'heroTagline', 'address', 'hours', 'about', 'mission'];
    const LANG_CONTENT_KEYS = [
      'introParagraphs', 'approachParagraphs', 'expertsParagraphs', 'imagingParagraphs',
      'conditions', 'feature', 'patientHero', 'backInGame', 'expertiseOverlay',
      'trustPoints', 'advantages', 'equipment', 'programs', 'awards', 'news',
      'storyVideos', 'patientStories', 'reviews'
    ];

    const merged = { ...baseData };
    if (cms.hospital) {
      merged.hospital = { ...merged.hospital };
      for (const [key, val] of Object.entries(cms.hospital)) {
        if (val == null || val === '') continue;
        if (!HOSPITAL_TEXT.includes(key)) merged.hospital[key] = val;
      }
      const MAP_KEYS = ['mapsQuery', 'mapLat', 'mapLng', 'mapsEmbed', 'mapsDirections'];
      for (const key of HOSPITAL_TEXT) {
        const cmsVal = cms.hospital[key];
        const locVal = locH[key];
        if (key === 'address') {
          merged.hospital.address = locVal || merged.hospital.address || cmsVal || '';
        } else {
          merged.hospital[key] = cmsVal || locVal || merged.hospital[key] || '';
        }
      }
      for (const key of MAP_KEYS) {
        const cmsVal = cms.hospital[key];
        if (cmsVal != null && cmsVal !== '') merged.hospital[key] = cmsVal;
      }
    }
    if (cms.departments?.length) {
      const locDepts = typeof I18n !== 'undefined' ? I18n.getContent()?.departments : null;
      merged.departments = mergeLocalizedById(cms.departments, locDepts);
    }
    if (cms.doctors?.length) {
      const locDocs = typeof I18n !== 'undefined' ? I18n.getContent()?.doctors : null;
      merged.doctors = mergeLocalizedById(cms.doctors, locDocs);
    }
    if (cms.serviceCategories?.length) {
      const locCats = typeof I18n !== 'undefined' ? I18n.getContent()?.serviceCategories : null;
      merged.serviceCategories = mergeLocalizedById(cms.serviceCategories, locCats);
    }
    if (cms.testimonials?.length) merged.reviews = cms.testimonials;

    const extraKeys = [
      'approachImage', 'expertsImage', 'imagingImage',
      'moveBetter', 'timeSlots',
      'pageImages', 'inlineText', 'elementStyles', 'pageFields'
    ];
    for (const key of extraKeys) {
      if (cms[key]) merged[key] = cms[key];
    }
    for (const key of LANG_CONTENT_KEYS) {
      if (!cms[key]) continue;
      const existing = merged[key];
      const hasExisting = Array.isArray(existing) ? existing.length > 0 : existing && typeof existing === 'object';
      if (!hasExisting) merged[key] = cms[key];
    }
    const locContent = typeof I18n !== 'undefined' ? I18n.getContent() : null;
    if (locContent?.conditions?.length) merged.conditions = locContent.conditions;
    if (cms.pageFields) merged.pageFields = cms.pageFields;
    if (cms.site) merged.site = { ...(merged.site || {}), ...cms.site };

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
