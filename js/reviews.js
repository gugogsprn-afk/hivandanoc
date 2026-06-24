(function () {
  let selectedRating = 0;

  function t(key, params) {
    return typeof I18n !== 'undefined' ? I18n.t(key, params) : key;
  }

  function apiBase() {
    if (typeof window.FORM_API_BASE === 'string') {
      return window.FORM_API_BASE.replace(/\/$/, '');
    }
    const h = location.hostname;
    if (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === 'healthyspinedoc.com' ||
      h === 'www.healthyspinedoc.com' ||
      h === '173.212.240.38'
    ) {
      return '';
    }
    return null;
  }

  function starsHtml(rating) {
    const n = Math.min(5, Math.max(0, Number(rating) || 0));
    let out = '';
    for (let i = 1; i <= 5; i += 1) {
      out += `<span class="hss-review-card__star${i <= n ? ' is-on' : ''}" aria-hidden="true">★</span>`;
    }
    return out;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initials(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`);
      if (Number.isNaN(d.getTime())) return '';
      const lang = typeof I18n !== 'undefined' ? I18n.getLang() : 'hy';
      const locale = lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-US';
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  }

  function fallbackReviews() {
    const data = typeof HospitalApp !== 'undefined' ? HospitalApp.getData() : null;
    const list = data?.reviews || [];
    return list.map((r, i) => ({
      id: r.id || `local-${i}`,
      name: r.author || r.name || '',
      text: r.text || r.quote || '',
      rating: r.rating || 5,
      created_at: null
    }));
  }

  async function fetchReviews() {
    const base = apiBase();
    const lang = typeof I18n !== 'undefined' ? I18n.getLang() : 'hy';
    if (base !== null) {
      try {
        const res = await fetch(`${base}/api/v1/public/reviews?lang=${encodeURIComponent(lang)}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(json.reviews)) {
          return json.reviews;
        }
      } catch {
        /* fallback */
      }
    }
    return fallbackReviews();
  }

  function updateSummary(reviews) {
    const avgEl = document.getElementById('reviews-avg-value');
    const avgStars = document.getElementById('reviews-avg-stars');
    const countEl = document.getElementById('reviews-count-value');
    if (!avgEl || !countEl) return;

    const count = reviews.length;
    countEl.textContent = String(count);

    if (!count) {
      avgEl.textContent = '—';
      if (avgStars) avgStars.innerHTML = starsHtml(0);
      return;
    }

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = sum / count;
    avgEl.textContent = avg.toFixed(1);
    if (avgStars) avgStars.innerHTML = starsHtml(Math.round(avg));
  }

  function renderReviews(reviews) {
    const mount = document.getElementById('reviews-list');
    if (!mount) return;

    updateSummary(reviews);

    if (!reviews.length) {
      mount.innerHTML = `
        <div class="hss-reviews-empty">
          <span class="hss-reviews-empty__icon" aria-hidden="true">☆</span>
          <p>${escapeHtml(t('pages.reviews.emptyList'))}</p>
        </div>`;
      return;
    }

    mount.innerHTML = reviews
      .map(
        (r, i) => `
      <article class="hss-review-card" style="animation-delay:${Math.min(i * 0.06, 0.36)}s">
        <span class="hss-review-card__quote" aria-hidden="true">"</span>
        <div class="hss-review-card__top">
          <span class="hss-review-card__avatar" aria-hidden="true">${escapeHtml(initials(r.name))}</span>
          <div class="hss-review-card__meta">
            <p class="hss-review-card__author">${escapeHtml(r.name)}</p>
            ${r.created_at ? `<time class="hss-review-card__date" datetime="${escapeHtml(r.created_at)}">${escapeHtml(formatDate(r.created_at))}</time>` : ''}
          </div>
        </div>
        <div class="hss-review-card__stars" aria-label="${escapeHtml(t('rating.starsLabel'))}: ${Number(r.rating) || 0}/5">
          ${starsHtml(r.rating)}
        </div>
        <p class="hss-review-card__text">${escapeHtml(r.text)}</p>
      </article>`
      )
      .join('');
  }

  async function loadReviews() {
    const reviews = await fetchReviews();
    renderReviews(reviews);
    return reviews;
  }

  function updateStarsHint(n) {
    const hint = document.getElementById('review-stars-hint');
    if (!hint) return;
    if (!n) {
      hint.textContent = t('rating.pickStars');
      hint.classList.remove('is-set');
      return;
    }
    hint.textContent = t('rating.starSelected', { n });
    hint.classList.add('is-set');
  }

  function initStars() {
    const row = document.getElementById('review-stars');
    if (!row) return;

    if (row.dataset.ready) {
      updateStarsHint(selectedRating);
      row.querySelectorAll('.hss-rating-star').forEach((star) => {
        star.setAttribute('aria-label', t('rating.starAria', { n: star.dataset.value }));
      });
      return;
    }

    row.dataset.ready = '1';
    row.innerHTML = '';
    for (let n = 1; n <= 5; n += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hss-rating-star';
      btn.dataset.value = String(n);
      btn.setAttribute('aria-label', t('rating.starAria', { n }));
      btn.innerHTML = '★';
      btn.addEventListener('click', () => {
        selectedRating = n;
        row.querySelectorAll('.hss-rating-star').forEach((star) => {
          star.classList.toggle('is-active', Number(star.dataset.value) <= n);
        });
        updateStarsHint(n);
      });
      row.appendChild(btn);
    }
    updateStarsHint(0);
  }

  function resetStars() {
    selectedRating = 0;
    document.querySelectorAll('#review-stars .hss-rating-star').forEach((star) => {
      star.classList.remove('is-active');
    });
    updateStarsHint(0);
  }

  function canSubmitReview() {
    try {
      const last = parseInt(localStorage.getItem('gkb_last_review') || '0', 10);
      if (Date.now() - last < 60000) return false;
      localStorage.setItem('gkb_last_review', String(Date.now()));
      return true;
    } catch {
      return true;
    }
  }

  async function submitReview(payload) {
    const base = apiBase();
    if (base === null) return { ok: false };
    const cmsUrl = `${base}/api/v1/public/leads/review`;
    try {
      const cmsRes = await fetch(cmsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const cmsJson = await cmsRes.json().catch(() => ({}));
      if (cmsRes.ok && cmsJson.ok !== false) return { ok: true, ...cmsJson };
    } catch {
      /* fall through */
    }
    const res = await fetch(`${base}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.ok !== false };
  }

  function bindForm() {
    const form = document.getElementById('review-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('review-form-msg');
      const success = document.getElementById('review-success');
      const fd = new FormData(form);

      if (!selectedRating) {
        msg.hidden = false;
        msg.className = 'hss-rating-form__msg hss-rating-form__msg--error';
        msg.textContent = t('rating.pickStars');
        if (success) success.hidden = true;
        return;
      }
      if (!canSubmitReview()) {
        msg.hidden = false;
        msg.className = 'hss-rating-form__msg hss-rating-form__msg--error';
        msg.textContent = t('rating.rateLimit');
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      msg.hidden = true;
      if (success) success.hidden = true;

      const payload = {
        rating: selectedRating,
        firstName: String(fd.get('firstName') || '').trim(),
        lastName: String(fd.get('lastName') || '').trim(),
        text: String(fd.get('text') || '').trim(),
        lang: typeof I18n !== 'undefined' ? I18n.getLang() : 'hy'
      };

      try {
        const result = await submitReview(payload);
        if (result.ok) {
          if (success) success.hidden = false;
          form.reset();
          resetStars();
          await loadReviews();
          document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          throw new Error('fail');
        }
      } catch {
        msg.hidden = false;
        msg.className = 'hss-rating-form__msg hss-rating-form__msg--error';
        msg.textContent = t('rating.error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'reviews') return;
    await (typeof HospitalApp !== 'undefined' ? HospitalApp.init() : Promise.resolve());
    initStars();
    bindForm();
    await loadReviews();
  });

  window.addEventListener('hospital:refresh', () => {
    if (document.body.dataset.page !== 'reviews') return;
    initStars();
    loadReviews();
    if (typeof I18n !== 'undefined') I18n.applyDOM();
  });
})();
