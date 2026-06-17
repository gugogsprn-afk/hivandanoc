let legalData = null;

async function loadLegalData() {
  if (legalData) return legalData;
  const base =
    typeof I18n !== 'undefined' && typeof I18n.getAssetBase === 'function'
      ? I18n.getAssetBase()
      : typeof HospitalApp !== 'undefined'
        ? HospitalApp.pathPrefix()
        : '';
  try {
    const res = await fetch(`${base}lang/legal.json`);
    if (res.ok) legalData = await res.json();
  } catch {
    /* offline */
  }
  legalData = legalData || {};
  return legalData;
}

function legalBundle(lang) {
  const code = lang || (typeof I18n !== 'undefined' ? I18n.getLang() : 'hy');
  return legalData?.[code] || legalData?.en || {};
}

async function getLegalText(path) {
  await loadLegalData();
  const parts = path.split('.');
  let val = legalBundle();
  for (const p of parts) {
    val = val?.[p];
    if (val === undefined) return undefined;
  }
  return val;
}

function renderLegalPage(pageId) {
  const root = document.getElementById('legal-content');
  if (!root || !pageId) return;

  const t = (k) => I18n.t(k);
  const prefix = typeof HospitalApp !== 'undefined' ? HospitalApp.pathPrefix() : '';
  const page = legalBundle()[`pages`]?.[pageId];
  if (!page) return;

  const nav = [
    { id: 'privacy', href: 'privacy-policy.html', label: 'footer.policyPrivacy' },
    { id: 'cookies', href: 'cookies-policy.html', label: 'footer.policyCookies' },
    { id: 'terms', href: 'terms.html', label: 'footer.policyTerms' },
    { id: 'patient', href: 'patient-information.html', label: 'footer.policyPatient' }
  ];

  const navHtml = nav
    .map(
      (item) =>
        `<a href="${prefix}${item.href}"${item.id === pageId ? ' aria-current="page"' : ''}>${t(item.label)}</a>`
    )
    .join('');

  const sectionsHtml = (page.sections || [])
    .map(
      (sec) => `
      <section class="hss-legal-section">
        <h2>${sec.heading || ''}</h2>
        <div class="hss-prose">${sec.body || ''}</div>
      </section>`
    )
    .join('');

  root.innerHTML = `
    <nav class="hss-legal-nav" aria-label="Legal">${navHtml}</nav>
    <p class="hss-legal-page__meta">${page.updated || ''}</p>
    ${sectionsHtml}`;

  const titleEl = document.getElementById('legal-page-title');
  if (titleEl) titleEl.textContent = page.title || '';
  document.title = page.title || document.title;
}

document.addEventListener('DOMContentLoaded', async () => {
  const pageId = document.body.dataset.legalPage;
  if (!pageId) return;
  await loadLegalData();
  await HospitalApp.init();
  renderLegalPage(pageId);
  I18n.onChange(async () => {
    await loadLegalData();
    renderLegalPage(pageId);
  });
});

window.LegalContent = { loadLegalData, getLegalText, legalBundle };
