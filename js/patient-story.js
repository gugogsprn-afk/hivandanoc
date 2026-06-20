/** Patient story detail page — ?id=ps1 */
let storyDetailsCache = null;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadStoryDetails() {
  if (storyDetailsCache) return storyDetailsCache;
  const base = typeof I18n.getAssetBase === 'function' ? I18n.getAssetBase() : '';
  try {
    const res = await fetch(`${base}data/patient-story-details.json`);
    if (res.ok) {
      storyDetailsCache = await res.json();
      return storyDetailsCache;
    }
  } catch {
    /* offline */
  }
  return null;
}

function getStoryParagraphs(details, lang, id) {
  let paragraphs = details?.[lang]?.[id]?.paragraphs;
  if (paragraphs?.length && lang === 'hy' && /[а-яА-ЯёЁ]/.test(paragraphs.join(' '))) {
    paragraphs = details?.en?.[id]?.paragraphs;
  }
  if (paragraphs?.length) return paragraphs;
  return details?.ru?.[id]?.paragraphs || [];
}

async function renderPatientStory() {
  const root = document.getElementById('patient-story-root');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const data = HospitalApp.getData();
  const story = data?.patientStories?.find((s) => s.id === id);
  const details = await loadStoryDetails();
  const lang = typeof I18n.getLang === 'function' ? I18n.getLang() : 'hy';
  const t = (k) => (typeof I18n.t === 'function' ? I18n.t(k) : k);

  if (!story) {
    root.innerHTML = `<p class="hss-patient-story__missing">${escapeHtml(t('pages.patientStory.notFound'))}</p>`;
    return;
  }

  const paragraphs = getStoryParagraphs(details, lang, id);
  const img = story.image || 'images/team-member-03.jpg';

  document.title = `${story.name} — ${t('pages.patientStory.titleShort')}`;

  root.innerHTML = `
    <header class="hss-patient-story__hero">
      <div class="hss-patient-story__photo">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(story.name)}" width="160" height="160" loading="eager" decoding="async">
      </div>
      <div class="hss-patient-story__meta">
        <h1 class="hss-serif">${escapeHtml(story.name)}</h1>
        <p class="hss-patient-story__loc">${escapeHtml(story.location || '')}</p>
        <p class="hss-patient-story__tx">${escapeHtml(story.treatment || '')}</p>
      </div>
    </header>
    <div class="hss-patient-story__body">
      ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
    </div>
    <div class="hss-patient-story__cta">
      <a href="appointment.html" class="hss-btn hss-btn--primary">${escapeHtml(t('pages.patientStory.bookCta'))}</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await HospitalApp.init();
  I18n.applyDOM();
  await renderPatientStory();
  if (typeof SiteSEO !== 'undefined') {
    SiteSEO.refresh(HospitalApp.getData(), { page: 'patient-story' });
  }
  window.addEventListener('hospital:refresh', async () => {
    I18n.applyDOM();
    await renderPatientStory();
  });
});
