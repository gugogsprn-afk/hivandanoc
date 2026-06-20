const fs = require('fs');
const path = require('path');
const { buildPublicContent } = require('../db/helpers');

const SITE_ROOT = path.join(__dirname, '../..');
const BASE = (process.env.PUBLIC_SITE_URL || 'https://healthyspinedoc.com').replace(/\/$/, '');

/** Clean URL → source HTML file + SEO profile */
const ROUTES = {
  '/find-a-doctor': {
    file: 'doctors.html',
    pageKey: 'doctors',
    title: 'Find a Doctor — Healthy Spine | Առողջ ողնաշար',
    description:
      'Find spine, joint, and rehabilitation specialists at Healthy Spine in Yerevan. Search doctors by specialty and book an appointment online.',
    h1: 'Find a Doctor',
    tagline: 'Qualified specialists in spine, joints, and musculoskeletal rehabilitation.',
    bodyHtml: (data) => {
      const items = (data.doctors || [])
        .slice(0, 24)
        .map(
          (d) =>
            `<li><strong>${esc(d.name)}</strong> — ${esc(d.role || '')}${d.location ? ` (${esc(d.location)})` : ''}</li>`
        )
        .join('');
      return `<section class="seo-crawl-content" id="seo-crawl-content"><h2>Our doctors</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url) => {
      const graphs = [clinicNode(data), breadcrumb(url, 'Find a Doctor')];
      (data.doctors || []).slice(0, 24).forEach((d) => {
        graphs.push({
          '@type': 'Physician',
          name: d.name,
          medicalSpecialty: d.role || 'Physician',
          worksFor: { '@type': 'MedicalClinic', name: clinicName(data) }
        });
      });
      return graphs;
    }
  },
  '/patient-care': {
    file: 'departments.html',
    pageKey: 'departments',
    title: 'Patient Care & Services — Healthy Spine | Առողջ ողնաշար',
    description:
      'Rehabilitation services for spine, joints, and musculoskeletal conditions at Healthy Spine — physiotherapy, diagnostics, and recovery programs.',
    h1: 'Patient Care & Services',
    tagline: 'Comprehensive rehabilitation and treatment programs for spine and joint care.',
    bodyHtml: (data) => {
      const items = (data.departments || [])
        .slice(0, 30)
        .map((s) => `<li><strong>${esc(s.name)}</strong>${s.description ? ` — ${esc(s.description)}` : ''}</li>`)
        .join('');
      return `<section class="seo-crawl-content" id="seo-crawl-content"><h2>Services & programs</h2><ul>${items}</ul></section>`;
    },
    jsonLd: (data, url) => {
      const graphs = [clinicNode(data), breadcrumb(url, 'Patient Care')];
      (data.departments || []).slice(0, 30).forEach((s) => {
        graphs.push({
          '@type': 'MedicalTherapy',
          name: s.name,
          description: s.description || '',
          provider: { '@type': 'MedicalClinic', name: clinicName(data) }
        });
      });
      return graphs;
    }
  },
  '/about': {
    file: 'about.html',
    pageKey: 'about',
    title: 'About Us — Healthy Spine | Առողջ ողնաշար',
    description:
      'About Healthy Spine rehabilitation center in Yerevan — mission, team, values, and evidence-based spine and joint care.',
    h1: 'About Healthy Spine',
    tagline: 'History, mission, and values of our rehabilitation center.',
    bodyHtml: (data) => {
      const h = data.hospital || {};
      return `<section class="seo-crawl-content" id="seo-crawl-content"><p>${esc(h.about || h.mission || 'Healthy Spine rehabilitation center in Yerevan.')}</p></section>`;
    },
    jsonLd: (data, url) => [clinicNode(data), breadcrumb(url, 'About')]
  },
  '/contact': {
    file: 'contacts.html',
    pageKey: 'contacts',
    title: 'Contact Us — Healthy Spine | Առողջ ողնաշար',
    description:
      'Contact Healthy Spine — phone, email, working hours, and online appointment booking in Yerevan.',
    h1: 'Contact Us',
    tagline: 'Call, email, or send a message to book an appointment.',
    bodyHtml: (data) => contactBlock(data, 'contact'),
    jsonLd: (data, url) => [localBusiness(data, url), breadcrumb(url, 'Contact')]
  },
  '/locations': {
    file: 'contacts.html',
    pageKey: 'locations',
    title: 'Locations — Healthy Spine | Առողջ ողնաշար',
    description:
      'Healthy Spine clinic location in Yerevan — address, directions, phone, and opening hours.',
    h1: 'Our Location',
    tagline: 'Visit Healthy Spine rehabilitation center in Yerevan.',
    bodyHtml: (data) => contactBlock(data, 'locations'),
    jsonLd: (data, url) => [localBusiness(data, url), breadcrumb(url, 'Locations')]
  }
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clinicName(data) {
  return data?.hospital?.name || 'Healthy Spine';
}

function clinicNode(data) {
  const h = data?.hospital || {};
  return {
    '@type': ['MedicalClinic', 'Organization'],
    name: clinicName(data),
    url: `${BASE}/`,
    telephone: h.phone || '',
    email: h.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: h.address || 'Yerevan',
      addressLocality: 'Yerevan',
      addressCountry: 'AM'
    }
  };
}

function localBusiness(data, url) {
  const h = data?.hospital || {};
  return {
    '@type': 'LocalBusiness',
    name: clinicName(data),
    url,
    telephone: h.phone || '',
    email: h.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: h.address || 'Yerevan',
      addressLocality: 'Yerevan',
      addressCountry: 'AM'
    },
    openingHours: h.hours || 'Mon–Fri 8:00–20:00'
  };
}

function breadcrumb(url, name) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name, item: url }
    ]
  };
}

function contactBlock(data, variant) {
  const h = data?.hospital || {};
  const map =
    variant === 'locations'
      ? `<p><strong>Address:</strong> ${esc(h.address || 'Yerevan, Armenia')}</p><p>Directions and map available on this page.</p>`
      : '';
  return `<section class="seo-crawl-content" id="seo-crawl-content">
    <p><strong>Phone:</strong> ${esc(h.phone || '')}</p>
    <p><strong>Email:</strong> ${esc(h.email || '')}</p>
    <p><strong>Hours:</strong> ${esc(h.hours || '')}</p>
    ${map}
  </section>`;
}

function headTags(meta, canonicalPath) {
  const url = `${BASE}${canonicalPath}`;
  const image = `${BASE}/images/brand/logo.png`;
  return `
    <meta name="description" content="${esc(meta.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="hy" href="${url}?lang=hy">
    <link rel="alternate" hreflang="ru" href="${url}?lang=ru">
    <link rel="alternate" hreflang="en" href="${url}?lang=en">
    <link rel="alternate" hreflang="x-default" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Healthy Spine">
    <meta property="og:title" content="${esc(meta.title)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(meta.title)}">
    <meta name="twitter:description" content="${esc(meta.description)}">
    <meta name="twitter:image" content="${image}">`;
}

function injectJsonLdScript(graphs) {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphs })}</script>`;
}

function replaceFirstHeroText(html, route) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(route.title)}</title>`);
  out = out.replace(/(<h1[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(route.h1)}$2`);
  out = out.replace(
    /(<p class="hss-hero__tagline"[^>]*data-i18n="pages\.[^"]+"[^>]*>)[^<]*(<\/p>)/,
    `$1${esc(route.tagline)}$2`
  );
  out = out.replace(/(<h1 class="hss-about-section__title"[^>]*id="about-article-title"[^>]*>)[^<]*(<\/h1>)/, `$1${esc(route.h1)}$2`);
  out = out.replace(/(<p class="hss-about-section__lead"[^>]*id="about-text"[^>]*>)[^<]*(<\/p>)/, `$1${esc(route.tagline)}$2`);
  return out;
}

function injectContactFields(html, data) {
  const h = data?.hospital || {};
  let out = html;
  out = out.replace(/(<p id="contact-phone"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.phone || '')}$2`);
  out = out.replace(/(<p id="contact-email"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.email || '')}$2`);
  out = out.replace(/(<p id="contact-address"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.address || '')}$2`);
  out = out.replace(/(<p id="contact-hours"[^>]*>)[^<]*(<\/p>)/, `$1${esc(h.hours || '')}$2`);
  return out;
}

function serveSeoPage(routePath) {
  const route = ROUTES[routePath];
  if (!route) return null;

  const filePath = path.join(SITE_ROOT, route.file);
  if (!fs.existsSync(filePath)) return null;

  const data = buildPublicContent('hy');
  let html = fs.readFileSync(filePath, 'utf8');
  const url = `${BASE}${routePath}`;

  html = html.replace(/<meta name="description"[^>]*>/gi, '');
  html = html.replace(/<meta name="robots"[^>]*>/gi, '');
  html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<meta property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<meta name="twitter:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<script type="application\/ld\+json" id="hss-jsonld"[^>]*>[\s\S]*?<\/script>/gi, '');

  const tags = headTags(route, routePath);
  html = html.replace('</head>', `${tags}\n${injectJsonLdScript(route.jsonLd(data, url))}\n</head>`);

  html = replaceFirstHeroText(html, route);

  if (route.pageKey === 'contacts' || route.pageKey === 'locations') {
    html = injectContactFields(html, data);
  }

  const body = route.bodyHtml(data);
  if (body) {
    if (html.includes('id="doctors-grid"')) {
      html = html.replace(/(<div class="hss-doctor-list" id="doctors-grid">)\s*(<\/div>)/, `$1${body}$2`);
    } else if (html.includes('id="departments-grid"')) {
      html = html.replace(/(<div id="departments-grid">)\s*(<\/div>)/, `$1${body}$2`);
    } else if (html.includes('id="main-content"')) {
      html = html.replace(/(<main[^>]*id="main-content"[^>]*>)/, `$1${body}`);
    } else {
      html = html.replace('</body>', `${body}\n</body>`);
    }
  }

  html = html.replace(
    '<body',
    `<body data-seo-canonical="${esc(routePath)}" data-seo-page="${esc(route.pageKey)}"`
  );

  return html;
}

module.exports = { ROUTES, serveSeoPage, BASE };
