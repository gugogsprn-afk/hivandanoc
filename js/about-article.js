/** Renders medical article on about.html from data/about-article.json */

let aboutArticleCache = null;

async function loadAboutArticle() {
  if (aboutArticleCache) return aboutArticleCache;
  const base = typeof I18n.getAssetBase === 'function' ? I18n.getAssetBase() : '';
  try {
    const res = await fetch(`${base}data/about-article.json`);
    if (res.ok) {
      aboutArticleCache = await res.json();
      return aboutArticleCache;
    }
  } catch {
    /* offline */
  }
  if (window.__ABOUT_ARTICLE__) {
    aboutArticleCache = window.__ABOUT_ARTICLE__;
    return aboutArticleCache;
  }
  return null;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderArticleBlocks(section) {
  let html = '';
  (section.paragraphs || []).forEach((p) => {
    html += `<p>${escapeHtml(p)}</p>`;
  });
  if (section.subheading) {
    html += `<h3 class="hss-about-article__subheading">${escapeHtml(section.subheading)}</h3>`;
  }
  if (section.listItems?.length) {
    html += `<ul class="hss-about-article__list">${section.listItems
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('')}</ul>`;
  }
  if (section.note) {
    html += `<aside class="hss-about-article__note"><p>${escapeHtml(section.note)}</p></aside>`;
  }
  return html;
}

function renderAboutArticle(lang) {
  const data = aboutArticleCache;
  const article = data?.[lang] || data?.hy;
  if (!article) return;

  const titleEl = document.getElementById('about-article-title');
  if (titleEl) titleEl.textContent = article.title;

  const leadEl = document.getElementById('about-text');
  const intro = article.sections?.find((s) => s.id === 'intro');
  if (leadEl && intro?.paragraphs?.[0]) {
    leadEl.textContent = intro.paragraphs[0];
  }

  const mount = document.getElementById('about-article');
  if (!mount || !article.sections) return;

  mount.innerHTML = article.sections
    .map((section) => {
      if (section.id === 'intro') {
        const rest = (section.paragraphs || []).slice(1);
        if (!rest.length && !section.listItems?.length && !section.note) return '';
        return `
        <div class="hss-about-article__section" id="article-${section.id}">
          <h2 class="hss-about-article__heading">${escapeHtml(section.heading)}</h2>
          ${rest.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          ${renderArticleBlocks({ ...section, paragraphs: [] })}
        </div>`;
      }
      return `
      <div class="hss-about-article__section" id="article-${section.id}">
        <h2 class="hss-about-article__heading">${escapeHtml(section.heading)}</h2>
        ${renderArticleBlocks(section)}
      </div>`;
    })
    .join('');
}

async function initAboutArticle() {
  await loadAboutArticle();
  const lang = typeof I18n.getLang === 'function' ? I18n.getLang() : 'hy';
  renderAboutArticle(lang);
}
