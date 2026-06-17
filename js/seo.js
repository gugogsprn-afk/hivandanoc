/**
 * SEO, Open Graph, Twitter Cards, JSON-LD, canonical URLs.
 */
const SiteSEO = (function () {
  const SITE = {
    name: 'Առողջ ողնաշար',
    org: 'CHIC NGO',
    baseUrl: 'http://173.212.240.38',
    defaultImage: 'images/brand/logo-chic.png',
    phone: '+37410000000',
    email: 'info@healthyspine.am'
  };

  const PAGE_META = {
    home: {
      descriptionKey: 'pages.home.seoDescription',
      fallbackDescription:
        'Առողջ ողնաշար — spine and joint rehabilitation center in Yerevan. Book an appointment with specialists.',
      path: '/index.html'
    },
    about: {
      descriptionKey: 'pages.about.seoDescription',
      fallbackDescription: 'About CHIC Healthy Spine rehabilitation center — mission, team, and evidence-based care.',
      path: '/about.html'
    },
    doctors: {
      descriptionKey: 'pages.doctors.seoDescription',
      fallbackDescription: 'Find a doctor at Healthy Spine — orthopedists, neurologists, physiotherapists in Yerevan.',
      path: '/doctors.html'
    },
    departments: {
      descriptionKey: 'pages.departments.seoDescription',
      fallbackDescription: 'Medical services and rehabilitation programs for spine, joints, and musculoskeletal care.',
      path: '/departments.html'
    },
    appointment: {
      descriptionKey: 'pages.appointment.seoDescription',
      fallbackDescription: 'Book an appointment online at Healthy Spine rehabilitation center.',
      path: '/appointment.html'
    },
    contacts: {
      descriptionKey: 'pages.contacts.seoDescription',
      fallbackDescription: 'Contact Healthy Spine — address, phone, hours, and directions in Yerevan.',
      path: '/contacts.html'
    },
    'submit-story': {
      descriptionKey: 'pages.submitStory.seoDescription',
      fallbackDescription: 'Share your recovery story with the Healthy Spine community.',
      path: '/submit-story.html'
    },
    'move-better': {
      descriptionKey: 'pages.moveBetter.seoDescription',
      fallbackDescription: 'Health articles and patient resources from Healthy Spine.',
      path: '/move-better.html'
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

  function upsertLink(rel, href, extras) {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    if (extras) Object.entries(extras).forEach(([k, v]) => el.setAttribute(k, v));
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

  function injectJsonLd(data) {
    const h = data?.hospital || {};
    const scriptId = 'hss-jsonld';
    let el = document.getElementById(scriptId);
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }

    const org = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: h.name || SITE.name,
      alternateName: SITE.org,
      url: absoluteUrl('/'),
      logo: absoluteUrl(assetBase() + SITE.defaultImage),
      image: absoluteUrl(assetBase() + SITE.defaultImage),
      telephone: h.phone || SITE.phone,
      email: h.email || SITE.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: h.address || 'Yerevan',
        addressLocality: 'Yerevan',
        addressCountry: 'AM'
      },
      openingHoursSpecification: [
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
      ],
      medicalSpecialty: ['PhysicalTherapy', 'Orthopedic', 'Neurologic'],
      sameAs: Object.values(h.social || {}).filter((u) => u && u !== '#')
    };

    const page = document.body?.dataset?.page;
    const graphs = [org];

    if (page && page !== 'home') {
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/index.html') },
          {
            '@type': 'ListItem',
            position: 2,
            name: document.title,
            item: window.location.href.split('?')[0]
          }
        ]
      });
    }

    el.textContent = JSON.stringify(graphs.length === 1 ? org : graphs);
  }

  function apply(pageOverride) {
    const page = pageOverride || document.body?.dataset?.page || 'home';
    const meta = PAGE_META[page] || PAGE_META.home;
    const title = document.title || SITE.name;
    const description = pageDescription(page, title);
    const url = absoluteUrl(meta.path);
    const image = absoluteUrl(assetBase() + SITE.defaultImage);

    upsertMeta('name', 'description', description);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:locale', document.documentElement.lang || 'hy_AM');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('name', 'author', SITE.org);
  }

  function refresh(data) {
    apply();
    if (data) injectJsonLd(data);
  }

  document.addEventListener('DOMContentLoaded', () => apply());
  window.addEventListener('hospital:refresh', () => {
    apply();
    if (typeof HospitalApp !== 'undefined') injectJsonLd(HospitalApp.getData());
  });

  return { apply, refresh, injectJsonLd, SITE };
})();
