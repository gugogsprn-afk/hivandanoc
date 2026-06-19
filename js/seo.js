/**
 * SEO, Open Graph, Twitter Cards, JSON-LD, canonical URLs, hreflang.
 */
const SiteSEO = (function () {
  const SITE = {
    name: 'Առողջ ողնաշար',
    org: '«Առողջ ողնաշար»',
    baseUrl: 'https://healthyspinedoc.com',
    defaultImage: 'images/brand/logo.png',
    phone: '+37410000000',
    email: 'info@healthyspine.am'
  };

  const LANGS = ['hy', 'ru', 'en'];

  const PAGE_META = {
    home: {
      descriptionKey: 'pages.home.seoDescription',
      fallbackDescription:
        'Առողջ ողնաշար — spine and joint rehabilitation center in Yerevan. Book an appointment with specialists.',
      canonical: '/'
    },
    about: {
      descriptionKey: 'pages.about.seoDescription',
      fallbackDescription: 'About «Առողջ ողնաշար» rehabilitation center — mission, team, and evidence-based care.',
      canonical: '/about'
    },
    doctors: {
      descriptionKey: 'pages.doctors.seoDescription',
      fallbackDescription: 'Find a doctor at Healthy Spine — orthopedists, neurologists, physiotherapists in Yerevan.',
      canonical: '/find-a-doctor'
    },
    departments: {
      descriptionKey: 'pages.departments.seoDescription',
      fallbackDescription: 'Medical services and rehabilitation programs for spine, joints, and musculoskeletal care.',
      canonical: '/patient-care'
    },
    appointment: {
      descriptionKey: 'pages.appointment.seoDescription',
      fallbackDescription: 'Book an appointment online at Healthy Spine rehabilitation center.',
      canonical: '/appointment.html'
    },
    contacts: {
      descriptionKey: 'pages.contacts.seoDescription',
      fallbackDescription: 'Contact Healthy Spine — address, phone, hours, and directions in Yerevan.',
      canonical: '/locations'
    },
    'submit-story': {
      descriptionKey: 'pages.submitStory.seoDescription',
      fallbackDescription: 'Share your recovery story with the Healthy Spine community.',
      canonical: '/submit-story.html'
    },
    'move-better': {
      descriptionKey: 'pages.moveBetter.seoDescription',
      fallbackDescription: 'Health articles and patient resources from Healthy Spine.',
      canonical: '/move-better'
    },
    'patient-story': {
      descriptionKey: 'pages.patientStory.seoDescription',
      fallbackDescription: 'Patient recovery story at Healthy Spine rehabilitation center.',
      canonical: '/patient-story.html'
    },
    'legal-privacy': {
      descriptionKey: 'footer.policyPrivacy',
      fallbackDescription: 'Privacy Policy — how Healthy Spine collects, uses, and protects your personal data.',
      canonical: '/privacy-policy.html'
    },
    'legal-cookies': {
      descriptionKey: 'footer.policyCookies',
      fallbackDescription: 'Cookie Policy — how we use cookies and similar technologies on healthyspinedoc.com.',
      canonical: '/cookies-policy.html'
    },
    'legal-terms': {
      descriptionKey: 'footer.policyTerms',
      fallbackDescription: 'Terms of Use for the Healthy Spine website.',
      canonical: '/terms.html'
    },
    'legal-patient': {
      descriptionKey: 'footer.policyPatient',
      fallbackDescription: 'Patient information and rights at Healthy Spine rehabilitation center.',
      canonical: '/patient-information.html'
    }
  };

  function assetBase() {
    if (window.location.pathname.includes('/admin/')) return '../';
    return '';
  }

  function absoluteUrl(path) {
    const base = SITE.baseUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  function currentCanonicalPath(page) {
    const meta = PAGE_META[page] || PAGE_META.home;
    if (page === 'patient-story') {
      const id = new URLSearchParams(window.location.search).get('id');
      return id ? `/patient-story.html?id=${encodeURIComponent(id)}` : meta.canonical;
    }
    return meta.canonical;
  }

  function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href, extras = {}) {
    if (!href) return;
    const selector =
      rel === 'alternate' && extras.hreflang
        ? `link[rel="alternate"][hreflang="${extras.hreflang}"]`
        : `link[rel="${rel}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    Object.entries(extras).forEach(([k, v]) => {
      if (k !== 'hreflang' || v) el.setAttribute(k, v);
    });
  }

  function hreflangUrl(canonicalPath, code) {
    const u = new URL(canonicalPath, `${SITE.baseUrl}/`);
    u.searchParams.set('lang', code);
    return u.href;
  }

  function injectHreflang(canonicalPath) {
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    LANGS.forEach((code) => {
      upsertLink('alternate', hreflangUrl(canonicalPath, code), { hreflang: code });
    });
    upsertLink('alternate', absoluteUrl(canonicalPath.split('?')[0] || '/'), { hreflang: 'x-default' });
  }

  function pageDescription(page, title) {
    const meta = PAGE_META[page];
    if (!meta) return `${title} — ${SITE.name}`;
    if (typeof I18n !== 'undefined' && meta.descriptionKey) {
      const t = I18n.t(meta.descriptionKey);
      if (t && t !== meta.descriptionKey) return t;
    }
    return meta.fallbackDescription;
  }

  function parseHours(hoursText) {
    if (!hoursText) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '15:00'
      }
    ];
  }

  function clinicGraph(h) {
    const base = {
      '@type': ['MedicalClinic', 'Organization', 'LocalBusiness'],
      name: h.name || SITE.name,
      alternateName: SITE.org,
      url: absoluteUrl('/'),
      logo: absoluteUrl(assetBase() + (h.logo || SITE.defaultImage)),
      image: absoluteUrl(assetBase() + (h.heroImage || h.logo || SITE.defaultImage)),
      telephone: h.phone || SITE.phone,
      email: h.email || SITE.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: h.address || 'Yerevan',
        addressLocality: 'Yerevan',
        addressCountry: 'AM'
      },
      openingHoursSpecification: parseHours(h.hours),
      medicalSpecialty: ['PhysicalTherapy', 'Orthopedic', 'Neurologic'],
      sameAs: Object.values(h.social || {}).filter((u) => u && u !== '#')
    };
    return { '@context': 'https://schema.org', ...base };
  }

  function physicianList(doctors) {
    return (doctors || []).slice(0, 24).map((d) => ({
      '@type': 'Physician',
      name: d.name,
      medicalSpecialty: d.role || 'Physician',
      image: d.image && !String(d.image).startsWith('http') ? absoluteUrl(assetBase() + d.image) : d.image,
      worksFor: { '@type': 'MedicalClinic', name: SITE.name }
    }));
  }

  function serviceList(departments) {
    return (departments || []).slice(0, 30).map((d) => ({
      '@type': 'MedicalTherapy',
      name: d.name,
      description: d.description || '',
      provider: { '@type': 'MedicalClinic', name: SITE.name }
    }));
  }

  function breadcrumb(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.item
      }))
    };
  }

  function injectJsonLd(data, page) {
    const h = data?.hospital || {};
    const scriptId = 'hss-jsonld';
    let el = document.getElementById(scriptId);
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }

    const graphs = [clinicGraph(h)];
    const canonical = currentCanonicalPath(page);
    const pageUrl = absoluteUrl(canonical);

    if (page && page !== 'home') {
      graphs.push(
        breadcrumb([
          { name: 'Home', item: absoluteUrl('/') },
          { name: document.title, item: pageUrl }
        ])
      );
    }

    if (page === 'doctors' && data?.doctors?.length) {
      graphs.push(...physicianList(data.doctors));
    }

    if (page === 'departments' && data?.departments?.length) {
      graphs.push(...serviceList(data.departments));
    }

    if (page === 'contacts') {
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: h.name || SITE.name,
        telephone: h.phone || SITE.phone,
        email: h.email || SITE.email,
        url: pageUrl,
        address: {
          '@type': 'PostalAddress',
          streetAddress: h.address || 'Yerevan',
          addressLocality: 'Yerevan',
          addressCountry: 'AM'
        },
        openingHoursSpecification: parseHours(h.hours)
      });
    }

    if (page === 'patient-story') {
      const id = new URLSearchParams(window.location.search).get('id');
      const story = data?.patientStories?.find((s) => s.id === id);
      if (story) {
        graphs.push({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: story.name,
          description: story.treatment || '',
          image: story.image,
          author: { '@type': 'Organization', name: SITE.name },
          publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absoluteUrl(assetBase() + SITE.defaultImage) } },
          mainEntityOfPage: pageUrl
        });
      }
    }

    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graphs });
  }

  function apply(pageOverride) {
    const page = pageOverride || document.body?.dataset?.page || 'home';
    const meta = PAGE_META[page] || PAGE_META.home;
    const title = document.title || SITE.name;
    const description = pageDescription(page, title);
    const canonicalPath = currentCanonicalPath(page);
    const url = absoluteUrl(canonicalPath);
    const image = absoluteUrl(assetBase() + SITE.defaultImage);
    const localeMap = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' };
    const lang = typeof I18n !== 'undefined' ? I18n.getLang() : document.documentElement.lang || 'hy';

    upsertMeta('name', 'description', description);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', page === 'patient-story' ? 'article' : 'website');
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:locale', localeMap[lang] || 'hy_AM');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('name', 'author', SITE.org);

    injectHreflang(canonicalPath);
  }

  function refresh(data, opts = {}) {
    const page = opts.page || document.body?.dataset?.page || 'home';
    apply(page);
    if (data) injectJsonLd(data, page);
  }

  document.addEventListener('DOMContentLoaded', () => apply());
  window.addEventListener('hospital:refresh', () => {
    apply();
    if (typeof HospitalApp !== 'undefined') injectJsonLd(HospitalApp.getData(), document.body?.dataset?.page || 'home');
  });

  return { apply, refresh, injectJsonLd, SITE, PAGE_META };
})();
