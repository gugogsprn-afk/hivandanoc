(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let currentUser = null;
  let activeLang = 'hy';
  let currentView = 'dashboard';

  const t = (key, params) => (typeof AdminI18n !== 'undefined' ? AdminI18n.t(key, params) : key);

  function toast(msg, type = 'success') {
    AdminUI.toast(msg, type);
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function injectNavIcons() {
    $$('.cms-nav__icon[data-icon]').forEach((el) => {
      const key = el.dataset.icon;
      if (AdminUI.ICONS[key]) el.innerHTML = AdminUI.ICONS[key];
    });
  }

  function langTabs(onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-lang-tabs';
    wrap.setAttribute('role', 'tablist');
    AdminConfig.langs.forEach((l) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = l.label;
      btn.dataset.lang = l.code;
      btn.setAttribute('role', 'tab');
      if (l.code === activeLang) btn.classList.add('active');
      btn.addEventListener('click', () => {
        activeLang = l.code;
        $$('.cms-lang-tabs button', wrap).forEach((b) => b.classList.toggle('active', b.dataset.lang === activeLang));
        onChange(activeLang);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function triField(label, prefix, values = {}, multiline = false) {
    const val = esc(values[activeLang] || values[`${prefix}_${activeLang}`] || '');
    const input = multiline
      ? `<textarea name="${prefix}_${activeLang}" rows="4">${val}</textarea>`
      : `<input name="${prefix}_${activeLang}" value="${val}">`;
    return `<div class="cms-field"><label>${label} <span class="cms-muted">(${activeLang.toUpperCase()})</span>${input}</label></div>`;
  }

  function collectTriplet(form, prefix) {
    const out = {};
    AdminConfig.langs.forEach((l) => {
      const el = form.querySelector(`[name="${prefix}_${l.code}"]`);
      if (el) out[`${prefix}_${l.code}`] = el.value;
    });
    return out;
  }

  function showView(name) {
    currentView = name;
    $$('.cms-view').forEach((v) => { v.hidden = true; });
    const view = $(`#view-${name}`);
    if (view) view.hidden = false;
    $$('#main-nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    AdminUI.setViewTitle(name);
    const sub = $('#view-subtitle');
    if (sub) sub.textContent = t(`view.subtitle.${name}`);
    const loaders = {
      dashboard: renderDashboard,
      leads: renderLeads,
      pages: renderPages,
      doctors: renderDoctors,
      services: renderServices,
      media: renderMedia,
      settings: renderSettings
    };
    loaders[name]?.();
  }

  async function renderDashboard() {
    const root = $('#view-dashboard');
    root.innerHTML = AdminUI.loadingHTML('Loading dashboard…');
    try {
      const data = await AdminApi.get('/admin/dashboard/stats');
      const appts = data.recentLeads.filter((l) => l.type === 'appointment').slice(0, 6);
      root.innerHTML = `
        <div class="cms-grid cms-grid--4">
          ${AdminUI.statCard(data.totalLeads, 'Total leads', 'teal', '📊')}
          ${AdminUI.statCard(data.newAppointments, 'New appointments', 'blue', '📅')}
          ${AdminUI.statCard(data.todayAppointments, "Today's appointments", 'green', '✓')}
          ${AdminUI.statCard(data.newContacts, 'New messages', 'amber', '✉️')}
        </div>
        <div class="cms-grid cms-grid--2" style="margin-top:1.25rem">
          ${AdminUI.card('Recent appointments', appts.length
            ? AdminUI.tableResponsive(`<thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Status</th></tr></thead><tbody>
              ${appts.map((l) => `<tr>
                <td>${esc(l.created_at?.slice(0, 16))}</td>
                <td>${esc(l.name)}</td>
                <td><a href="tel:${esc(l.phone)}">${esc(l.phone)}</a></td>
                <td>${AdminUI.statusBadge(l.status)}</td>
              </tr>`).join('')}
            </tbody>`)
            : AdminUI.emptyHTML('No appointments yet', 'New booking requests will appear here.', '<button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-go="leads">View leads</button>')
          )}
          ${AdminUI.card('Quick actions', `
            <div class="cms-quick-actions">
              <button type="button" class="cms-btn cms-btn--ghost" data-go="pages">📄 Pages</button>
              <button type="button" class="cms-btn cms-btn--ghost" data-go="doctors">👨‍⚕️ Doctors</button>
              <button type="button" class="cms-btn cms-btn--ghost" data-go="services">🩺 Services</button>
              <button type="button" class="cms-btn cms-btn--ghost" data-go="media">🖼️ Media</button>
              <button type="button" class="cms-btn cms-btn--ghost" data-go="settings">⚙️ Settings</button>
              <button type="button" class="cms-btn cms-btn--ghost" data-go="leads">📋 Leads</button>
            </div>`)}
        </div>`;
      $$('[data-go]', root).forEach((btn) => {
        btn.addEventListener('click', () => showView(btn.dataset.go));
      });
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(esc(err.message), 'retry-dashboard');
      $('#retry-dashboard', root)?.addEventListener('click', renderDashboard);
    }
  }

  async function renderLeads() {
    const root = $('#view-leads');
    root.innerHTML = AdminUI.loadingHTML('Loading leads…');
    try {
      const data = await AdminApi.get('/admin/leads');
      const rows = data.leads.map(leadRow).join('');
      root.innerHTML = AdminUI.card(
        `All leads (${data.leads.length})`,
        `${AdminUI.pageIntro('Update status and add internal notes. Changes are saved immediately.')}
        <div class="cms-filters" id="lead-filters">
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm active" data-filter="">All</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-filter="new">New</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-filter="contacted">Contacted</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-filter="booked">Booked</button>
          <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-filter="cancelled">Cancelled</button>
        </div>
        ${data.leads.length
          ? AdminUI.tableResponsive(`<thead><tr>
            <th>ID</th><th>Date</th><th>Type</th><th>Name</th><th>Phone</th><th>Email</th>
            <th>Service</th><th>Preferred</th><th>Status</th><th>Notes</th><th></th>
          </tr></thead><tbody id="leads-tbody">${rows}</tbody>`)
          : AdminUI.emptyHTML('No leads yet', 'Appointment and contact form submissions will appear here.')}`
      );

      $$('#lead-filters button', root).forEach((btn) => {
        btn.addEventListener('click', async () => {
          $$('#lead-filters button', root).forEach((b) => b.classList.toggle('active', b === btn));
          const q = btn.dataset.filter ? `?status=${btn.dataset.filter}` : '';
          const res = await AdminApi.get(`/admin/leads${q}`);
          const tbody = $('#leads-tbody', root);
          if (!tbody) return;
          if (!res.leads.length) {
            tbody.innerHTML = `<tr><td colspan="11" class="cms-muted" style="text-align:center;padding:2rem">No leads match this filter.</td></tr>`;
          } else {
            tbody.innerHTML = res.leads.map(leadRow).join('');
          }
          bindLeadActions(root);
        });
      });
      bindLeadActions(root);
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(esc(err.message), 'retry-leads');
      $('#retry-leads', root)?.addEventListener('click', renderLeads);
    }
  }

  function leadRow(l) {
    return `<tr data-id="${l.id}">
      <td><strong>#${l.id}</strong></td>
      <td>${esc(l.created_at?.slice(0, 16).replace('T', ' '))}</td>
      <td>${esc(l.type)}</td>
      <td>${esc(l.name)}</td>
      <td><a href="tel:${esc(l.phone)}">${esc(l.phone)}</a></td>
      <td>${l.email ? `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : '—'}</td>
      <td>${esc(l.service_id || l.department_id || '—')}</td>
      <td>${esc(l.preferred_date || '—')} ${esc(l.preferred_time || '')}</td>
      <td><select class="lead-status" aria-label="Status">
        ${['new', 'contacted', 'booked', 'cancelled'].map((s) =>
          `<option value="${s}"${l.status === s ? ' selected' : ''}>${s}</option>`
        ).join('')}
      </select></td>
      <td><input class="lead-notes" value="${esc(l.admin_notes || '')}" placeholder="Internal note…"></td>
      <td><button type="button" class="cms-btn cms-btn--sm cms-btn--primary save-lead">Save</button></td>
    </tr>`;
  }

  function bindLeadActions(root) {
    $$('.save-lead', root).forEach((btn) => {
      btn.addEventListener('click', async () => {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        btn.disabled = true;
        btn.textContent = '…';
        try {
          await AdminApi.patch(`/admin/leads/${id}`, {
            status: $('.lead-status', tr).value,
            admin_notes: $('.lead-notes', tr).value
          });
          toast('Lead updated', 'success');
        } catch (err) {
          toast(err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Save';
        }
      });
    });
  }

  async function renderPages() {
    const root = $('#view-pages');
    root.innerHTML = AdminUI.loadingHTML('Loading visual editor…');
    if (!AdminApi.token()) {
      root.innerHTML = AdminUI.errorHTML(t('common.signInFirst'));
      return;
    }
    try {
      PageEditor.mount(root);
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(err.message, 'retry-pages');
      $('#retry-pages', root)?.addEventListener('click', renderPages);
    }
  }

  let editingDoctorId = null;

  async function renderDoctors() {
    const root = $('#view-doctors');
    root.innerHTML = AdminUI.loadingHTML('Loading doctors…');
    try {
      const data = await AdminApi.get('/admin/doctors');
      root.innerHTML = `
        <div class="cms-split">
          <div class="cms-panel">
            <div class="cms-panel__head">
              <h2>Doctors (${data.doctors.length})</h2>
              <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="add-doctor">+ Add doctor</button>
            </div>
            <div class="cms-panel__body">
              ${data.doctors.length
                ? AdminUI.tableResponsive(`<thead><tr><th></th><th>Name</th><th>Specialty</th><th></th></tr></thead><tbody id="doctors-tbody">
                  ${data.doctors.map((d) => `<tr>
                    <td>${d.image_url ? `<img src="${esc(d.image_url)}" alt="" width="40" height="40" style="border-radius:50%;object-fit:cover" onerror="this.style.display='none'">` : '👤'}</td>
                    <td><strong>${esc(d.name_ru || d.name_hy || d.id)}</strong>${d.published === 0 ? ' <span class="cms-muted">(draft)</span>' : ''}</td>
                    <td>${esc(d.role_ru || d.role_hy || '—')}</td>
                    <td><button type="button" class="cms-btn cms-btn--sm cms-btn--ghost" data-edit-doctor="${d.id}">Edit</button></td>
                  </tr>`).join('')}
                </tbody>`)
                : AdminUI.emptyHTML('No doctors yet', 'Add your first doctor to show on the public website.', '<button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="add-doctor-empty">+ Add doctor</button>')}
            </div>
          </div>
          <div class="cms-panel" id="doctor-form-card" hidden>
            <div class="cms-panel__head"><h2 id="doctor-form-title">Doctor</h2></div>
            <div class="cms-panel__body"><form id="doctor-form" class="cms-form"></form></div>
          </div>
        </div>`;

      $('#add-doctor', root)?.addEventListener('click', () => openDoctorForm(null));
      $('#add-doctor-empty', root)?.addEventListener('click', () => openDoctorForm(null));
      $$('[data-edit-doctor]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          openDoctorForm(data.doctors.find((d) => d.id === btn.dataset.editDoctor));
        });
      });
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(esc(err.message), 'retry-doctors');
      $('#retry-doctors', root)?.addEventListener('click', renderDoctors);
    }
  }

  function openDoctorForm(doc) {
    editingDoctorId = doc?.id || null;
    const card = $('#doctor-form-card');
    card.hidden = false;
    $('#doctor-form-title').textContent = doc ? 'Edit doctor' : 'New doctor';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const form = $('#doctor-form');

    const renderForm = () => {
      form.innerHTML = '';
      form.prepend(langTabs(renderForm));
      form.insertAdjacentHTML('beforeend', `
        <div class="cms-form__section">
          <h3>Basic information</h3>
          ${triField('Full name', 'name', doc || {})}
          ${triField('Role / Specialty', 'role', doc || {})}
          ${triField('Short bio', 'bio', doc || {}, true)}
        </div>
        <div class="cms-form__section">
          <h3>Details</h3>
          <div class="cms-field"><label>Linked service ID<input name="department_id" value="${esc(doc?.department_id || '')}" placeholder="e.g. consult-spine"></label></div>
          <div class="cms-field"><label>Photo URL<input name="image_url" value="${esc(doc?.image_url || '')}" placeholder="Paste URL from Media Library"></label></div>
          ${doc?.image_url ? `<img src="${esc(doc.image_url)}" alt="" style="max-width:120px;border-radius:8px;border:1px solid var(--cms-border)" onerror="this.hidden=true">` : ''}
          <div class="cms-field"><label>Experience<input name="experience" value="${esc(doc?.experience || '')}" placeholder="e.g. 15 years"></label></div>
          <div class="cms-form__checks">
            <label><input type="checkbox" name="is_surgeon" ${doc?.is_surgeon ? 'checked' : ''}> Surgeon</label>
            <label><input type="checkbox" name="published" ${doc?.published !== 0 ? 'checked' : ''}> Published on website</label>
          </div>
        </div>
        <div class="cms-actions">
          <button type="submit" class="cms-btn cms-btn--primary">Save doctor</button>
          ${doc ? '<button type="button" class="cms-btn cms-btn--danger" id="delete-doctor">Delete</button>' : ''}
        </div>`);
      $('#delete-doctor', form)?.addEventListener('click', async () => {
        if (!confirm('Delete this doctor permanently?')) return;
        await AdminApi.del(`/admin/doctors/${doc.id}`);
        toast('Doctor deleted');
        renderDoctors();
      });
    };
    renderForm();

    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      const body = {
        ...collectTriplet(form, 'name'),
        ...collectTriplet(form, 'role'),
        ...collectTriplet(form, 'bio'),
        department_id: form.department_id.value,
        image_url: form.image_url.value,
        experience: form.experience.value,
        is_surgeon: form.is_surgeon.checked,
        published: form.published.checked
      };
      try {
        if (editingDoctorId) await AdminApi.put(`/admin/doctors/${editingDoctorId}`, body);
        else await AdminApi.post('/admin/doctors', body);
        toast('Doctor saved', 'success');
        renderDoctors();
      } catch (err) { toast(err.message, 'error'); }
      finally { btn.disabled = false; }
    };
  }

  async function renderServices() {
    const root = $('#view-services');
    root.innerHTML = AdminUI.loadingHTML('Loading services…');
    try {
      const [svcData, catData] = await Promise.all([
        AdminApi.get('/admin/services'),
        AdminApi.get('/admin/services/categories')
      ]);
      let editingServiceId = null;

      root.innerHTML = `
        <div class="cms-split">
          <div class="cms-panel">
            <div class="cms-panel__head">
              <h2>Services (${svcData.services.length})</h2>
              <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="add-service">+ Add service</button>
            </div>
            <div class="cms-panel__body">
              ${svcData.services.length
                ? AdminUI.tableResponsive(`<thead><tr><th>Title</th><th>Category</th><th>Status</th><th></th></tr></thead><tbody>
                  ${svcData.services.map((s) => `<tr>
                    <td><strong>${esc(s.title_ru || s.title_hy || s.id)}</strong></td>
                    <td><span class="cms-badge">${esc(s.category_id)}</span></td>
                    <td>${s.published === 0 ? '<span class="cms-muted">Draft</span>' : '<span style="color:var(--cms-success)">Live</span>'}</td>
                    <td><button type="button" class="cms-btn cms-btn--sm cms-btn--ghost" data-edit-svc="${s.id}">Edit</button></td>
                  </tr>`).join('')}
                </tbody>`)
                : AdminUI.emptyHTML('No services yet', 'Add services to display on the departments page.')}
            </div>
          </div>
          <div class="cms-panel" id="service-form-card" hidden>
            <div class="cms-panel__head"><h2 id="service-form-title">Service</h2></div>
            <div class="cms-panel__body"><form id="service-form" class="cms-form"></form></div>
          </div>
        </div>`;

      $('#add-service', root).addEventListener('click', () => openServiceForm(null, catData.categories));
      $$('[data-edit-svc]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          openServiceForm(svcData.services.find((s) => s.id === btn.dataset.editSvc), catData.categories);
        });
      });

      function openServiceForm(svc, categories) {
        editingServiceId = svc?.id || null;
        $('#service-form-card').hidden = false;
        $('#service-form-title').textContent = svc ? 'Edit service' : 'New service';
        const form = $('#service-form');

        const renderForm = () => {
          form.innerHTML = '';
          form.prepend(langTabs(renderForm));
          const catOpts = categories.map((c) =>
            `<option value="${c.id}"${svc?.category_id === c.id ? ' selected' : ''}>${esc(c.name_ru || c.id)}</option>`
          ).join('');
          let items = [];
          try { items = JSON.parse(svc?.items_json || '[]'); } catch { items = []; }
          form.insertAdjacentHTML('beforeend', `
            ${triField('Service title', 'title', svc || {})}
            ${triField('Description', 'description', svc || {}, true)}
            <div class="cms-form__row">
              <div class="cms-field"><label>Category<select name="category_id">${catOpts}</select></label></div>
              <div class="cms-field"><label>Icon<input name="icon" value="${esc(svc?.icon || '🩺')}"></label></div>
            </div>
            <div class="cms-field"><label>Image URL<input name="image_url" value="${esc(svc?.image_url || '')}"></label></div>
            <div class="cms-form__row">
              <div class="cms-field"><label>Price (optional)<input name="price" value="${esc(svc?.price || '')}"></label></div>
              <div class="cms-field"><label>Duration (optional)<input name="duration" value="${esc(svc?.duration || '')}"></label></div>
            </div>
            <div class="cms-field"><label>Sub-services <span class="cms-muted">(one per line)</span><textarea name="items" rows="4">${esc(items.join('\n'))}</textarea></label></div>
            <label class="cms-toggle"><input type="checkbox" name="published" ${svc?.published !== 0 ? 'checked' : ''}> Published on website</label>
            <button type="submit" class="cms-btn cms-btn--primary">Save service</button>`);
        };
        renderForm();

        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = form.querySelector('[type="submit"]');
          btn.disabled = true;
          const body = {
            ...collectTriplet(form, 'title'),
            ...collectTriplet(form, 'description'),
            category_id: form.category_id.value,
            icon: form.icon.value,
            image_url: form.image_url.value,
            price: form.price.value,
            duration: form.duration.value,
            items: form.items.value.split('\n').map((s) => s.trim()).filter(Boolean),
            published: form.published.checked
          };
          try {
            if (editingServiceId) await AdminApi.put(`/admin/services/${editingServiceId}`, body);
            else await AdminApi.post('/admin/services', body);
            toast('Service saved', 'success');
            renderServices();
          } catch (err) { toast(err.message, 'error'); }
          finally { btn.disabled = false; }
        };
      }
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(esc(err.message), 'retry-services');
      $('#retry-services', root)?.addEventListener('click', renderServices);
    }
  }

  async function renderMedia() {
    const root = $('#view-media');
    root.innerHTML = AdminUI.loadingHTML('Loading media…');

    root.innerHTML = `
      <div class="cms-grid cms-grid--2">
        ${AdminUI.card('Upload file', `
          <div class="cms-upload-zone">
            <p>Images (JPG, PNG, WebP, GIF, SVG) and videos (MP4, WebM) up to 10 MB</p>
            <form id="upload-form" class="cms-form">
              <div class="cms-field"><label>Choose file<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm" required></label></div>
              <div class="cms-field"><label>Folder<select name="folder">
                <option value="general">General</option>
                <option value="doctors">Doctors</option>
                <option value="clinic">Clinic</option>
                <option value="blog">Blog</option>
              </select></label></div>
              <button type="submit" class="cms-btn cms-btn--primary">Upload</button>
            </form>
          </div>`)}
        ${AdminUI.card('Library', '<div id="media-grid" class="cms-media-grid">' + AdminUI.loadingHTML('Loading files…') + '</div>')}
      </div>`;

    async function loadGrid() {
      const grid = $('#media-grid', root);
      try {
        const data = await AdminApi.get('/admin/media');
        if (!data.media.length) {
          grid.innerHTML = AdminUI.emptyHTML('No files yet', 'Upload photos for doctors, clinic, or blog covers.');
          return;
        }
        const base = AdminConfig.apiBase().replace('/api/v1', '');
        grid.innerHTML = data.media.map((m) => `
          <figure class="cms-media-item">
            ${m.mime_type?.startsWith('video/')
              ? `<video src="${base}${m.url}" controls preload="metadata"></video>`
              : `<img src="${base}${m.url}" alt="" loading="lazy" onerror="this.src='';this.alt='Failed to load'">`}
            <figcaption>
              <span>${esc(m.original_name || m.filename)}</span>
              <span class="cms-muted">${esc(m.folder)} · ${Math.round((m.size || 0) / 1024)} KB</span>
              <div class="cms-actions">
                <button type="button" class="cms-btn cms-btn--sm cms-btn--ghost copy-url" data-url="${base}${m.url}">Copy URL</button>
                <button type="button" class="cms-btn cms-btn--sm cms-btn--danger del-media" data-id="${m.id}">Delete</button>
              </div>
            </figcaption>
          </figure>`).join('');

        $$('.copy-url', grid).forEach((btn) => {
          btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.url);
            toast('URL copied to clipboard');
          });
        });
        $$('.del-media', grid).forEach((btn) => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this file permanently?')) return;
            await AdminApi.del(`/admin/media/${btn.dataset.id}`);
            toast('File deleted');
            loadGrid();
          });
        });
      } catch (err) {
        grid.innerHTML = AdminUI.errorHTML(esc(err.message));
      }
    }

    $('#upload-form', root).addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Uploading…';
      try {
        await AdminApi.upload('/admin/media/upload', new FormData(e.target));
        toast('File uploaded', 'success');
        e.target.reset();
        loadGrid();
      } catch (err) { toast(err.message, 'error'); }
      finally { btn.disabled = false; btn.textContent = 'Upload'; }
    });

    await loadGrid();
  }

  async function renderSettings() {
    const root = $('#view-settings');
    root.innerHTML = AdminUI.loadingHTML('Loading settings…');
    try {
      const data = await AdminApi.get('/admin/settings');
      const g = data.global?.hospital || {};
      root.innerHTML = AdminUI.card('Global clinic settings', '<form id="settings-form" class="cms-form"></form>');
      const form = $('#settings-form', root);

      const renderForm = () => {
        form.innerHTML = '';
        form.prepend(langTabs(renderForm));
        const pick = (field) => ({ hy: g[field]?.hy || '', ru: g[field]?.ru || '', en: g[field]?.en || '' });
        form.insertAdjacentHTML('beforeend', `
          <div class="cms-form__section">
            <h3>Clinic identity (multilingual)</h3>
            ${triField('Clinic name', 'name', pick('name'))}
            ${triField('Tagline', 'tagline', pick('tagline'))}
            ${triField('Address', 'address', pick('address'))}
            ${triField('Working hours', 'hours', pick('hours'))}
          </div>
          <div class="cms-form__section">
            <h3>Contact</h3>
            <div class="cms-form__row">
              <div class="cms-field"><label>Phone<input name="phone" value="${esc(g.phone || '')}"></label></div>
              <div class="cms-field"><label>Email<input name="email" type="email" value="${esc(g.email || '')}"></label></div>
            </div>
          </div>
          <div class="cms-form__section">
            <h3>Branding images</h3>
            <div class="cms-field"><label>Logo URL<input name="logo" value="${esc(g.logo || '')}"></label></div>
            <div class="cms-field"><label>Hero image URL<input name="heroImage" value="${esc(g.heroImage || '')}"></label></div>
          </div>
          <div class="cms-form__section">
            <h3>Social media</h3>
            <div class="cms-field"><label>Facebook<input name="facebook" value="${esc(g.social?.facebook || '')}"></label></div>
            <div class="cms-field"><label>Instagram<input name="instagram" value="${esc(g.social?.instagram || '')}"></label></div>
            <div class="cms-field"><label>LinkedIn<input name="linkedin" value="${esc(g.social?.linkedin || '')}"></label></div>
          </div>
          <button type="submit" class="cms-btn cms-btn--primary">Save all settings</button>`);
      };
      renderForm();

      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        btn.disabled = true;
        const hospital = {
          name: {}, tagline: {}, address: {}, hours: {},
          phone: form.phone.value, email: form.email.value,
          logo: form.logo.value, heroImage: form.heroImage.value,
          social: { facebook: form.facebook.value, instagram: form.instagram.value, linkedin: form.linkedin.value }
        };
        AdminConfig.langs.forEach((l) => {
          hospital.name[l.code] = form.querySelector(`[name="name_${l.code}"]`)?.value || '';
          hospital.tagline[l.code] = form.querySelector(`[name="tagline_${l.code}"]`)?.value || '';
          hospital.address[l.code] = form.querySelector(`[name="address_${l.code}"]`)?.value || '';
          hospital.hours[l.code] = form.querySelector(`[name="hours_${l.code}"]`)?.value || '';
        });
        try {
          await AdminApi.put('/admin/settings/global', { hospital });
          toast('Settings saved', 'success');
        } catch (err) { toast(err.message, 'error'); }
        finally { btn.disabled = false; }
      };
    } catch (err) {
      root.innerHTML = AdminUI.errorHTML(esc(err.message), 'retry-settings');
      $('#retry-settings', root)?.addEventListener('click', renderSettings);
    }
  }

  window.__cmsShowView = (name, doctorId) => {
    showView(name);
    if (name === 'doctors' && doctorId) {
      setTimeout(() => {
        document.querySelector(`[data-edit-doctor="${doctorId}"]`)?.click();
      }, 600);
    }
  };

  async function bootApp(user) {
    currentUser = user;
    document.body.classList.add('cms-authenticated');
    $('#login-screen').hidden = true;
    $('#app-shell').hidden = false;
    $('#user-email').textContent = user.email;
    $('#user-role').textContent = (user.role || '').replace('_', ' ');
    showView('dashboard');
  }

  async function init() {
    if (typeof AdminI18n !== 'undefined') AdminI18n.init();
    injectNavIcons();
    AdminUI.bindMobileNav();

    if (typeof AdminI18n !== 'undefined') {
      AdminI18n.onChange(() => {
        const loaders = {
          dashboard: renderDashboard,
          leads: renderLeads,
          pages: renderPages,
          doctors: renderDoctors,
          services: renderServices,
          media: renderMedia,
          settings: renderSettings
        };
        loaders[currentView]?.();
      });
    }

    $$('#main-nav button').forEach((btn) => {
      btn.addEventListener('click', () => showView(btn.dataset.view));
    });

    $('#logout-btn').addEventListener('click', () => {
      AdminApi.setToken('');
      location.reload();
    });

    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errEl = $('#login-error');
      errEl.hidden = true;
      AdminUI.setLoginLoading(true);
      try {
        const res = await AdminApi.post('/auth/login', {
          email: fd.get('email'),
          password: fd.get('password')
        });
        AdminApi.setToken(res.token);
        await bootApp(res.user);
      } catch (err) {
        errEl.hidden = false;
        errEl.textContent = err.message;
      } finally {
        AdminUI.setLoginLoading(false);
      }
    });

    if (AdminApi.token()) {
      try {
        const res = await AdminApi.get('/auth/me');
        await bootApp(res.user);
        return;
      } catch {
        AdminApi.setToken('');
      }
    }
    $('#login-screen').hidden = false;
    $('#app-shell').hidden = true;
    document.body.classList.remove('cms-authenticated');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
