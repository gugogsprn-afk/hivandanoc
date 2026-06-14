document.addEventListener('DOMContentLoaded', async () => {
  await HospitalApp.init();
  I18n.applyDOM();

  const loginView = document.getElementById('login-view');
  const adminView = document.getElementById('admin-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const t = (k) => I18n.t(k);

  function showAdmin() {
    loginView.hidden = true;
    adminView.hidden = false;
    renderAppointments();
    loadContentForm();
    I18n.applyDOM();
  }

  function showLogin() {
    loginView.hidden = false;
    adminView.hidden = true;
    HospitalStorage.logout();
  }

  if (HospitalStorage.isLoggedIn()) showAdmin();

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (HospitalStorage.login(new FormData(loginForm).get('password'))) {
      loginError.hidden = true;
      showAdmin();
    } else {
      loginError.hidden = false;
      loginError.textContent = t('admin.wrongPassword');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', showLogin);

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((x) => x.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-appointments').hidden = tab.dataset.tab !== 'appointments';
      document.getElementById('tab-content').hidden = tab.dataset.tab !== 'content';
    });
  });

  function statusLabel(s) {
    const map = {
      new: t('admin.statusNew'),
      confirmed: t('admin.statusConfirmed'),
      cancelled: t('admin.statusCancelled')
    };
    return map[s] || s;
  }

  function renderAppointments() {
    const tbody = document.getElementById('appointments-tbody');
    const empty = document.getElementById('no-appointments');
    const list = HospitalStorage.getAppointments();
    const data = HospitalApp.getData();
    const locale = I18n.getLang() === 'hy' ? 'hy-AM' : I18n.getLang() === 'en' ? 'en-US' : 'ru-RU';

    if (!list.length) {
      tbody.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    tbody.innerHTML = list
      .map((a) => {
        const dept = data.departments.find((d) => d.id === a.departmentId);
        const doc = data.doctors.find((d) => d.id === a.doctorId);
        const created = new Date(a.createdAt).toLocaleString(locale);
        return `<tr>
          <td>${created}</td>
          <td>${escapeHtml(a.patientName)}</td>
          <td>${escapeHtml(a.phone)}</td>
          <td>${escapeHtml(dept?.name || a.departmentId)}</td>
          <td>${a.date} ${a.time}${doc ? '<br><small>' + escapeHtml(doc.name) + '</small>' : ''}</td>
          <td><span class="status-badge status-${a.status}">${statusLabel(a.status)}</span></td>
          <td>
            ${a.status === 'new' ? `<button class="btn-small btn-confirm" data-action="confirm" data-id="${a.id}">✓</button>` : ''}
            ${a.status !== 'cancelled' ? `<button class="btn-small btn-cancel" data-action="cancel" data-id="${a.id}">✕</button>` : ''}
            <button class="btn-small btn-delete" data-action="delete" data-id="${a.id}">🗑</button>
          </td>
        </tr>`;
      })
      .join('');

    tbody.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { id, action } = btn.dataset;
      if (action === 'confirm') HospitalStorage.updateAppointment(id, { status: 'confirmed' });
      if (action === 'cancel') HospitalStorage.updateAppointment(id, { status: 'cancelled' });
      if (action === 'delete') HospitalStorage.deleteAppointment(id);
      renderAppointments();
    };
  }

  function loadContentForm() {
    const h = HospitalApp.getData().hospital;
    const form = document.getElementById('content-form');
    form.hospitalName.value = h.name;
    form.shortName.value = h.shortName;
    form.tagline.value = h.tagline;
    form.phone.value = h.phone;
    form.aboutText.value = h.about;
    form.missionText.value = h.mission;
  }

  document.getElementById('content-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = HospitalApp.getData();
    const fd = new FormData(e.target);
    const override = {
      ...current,
      hospital: {
        ...current.hospital,
        name: fd.get('hospitalName'),
        shortName: fd.get('shortName'),
        tagline: fd.get('tagline'),
        phone: fd.get('phone'),
        about: fd.get('aboutText'),
        mission: fd.get('missionText')
      }
    };
    HospitalStorage.setContentOverride(override);
    await HospitalApp.refreshLanguage();
    loadContentForm();
    const saved = document.getElementById('content-saved');
    saved.hidden = false;
    setTimeout(() => { saved.hidden = true; }, 3000);
  });

  document.getElementById('reset-content').addEventListener('click', async () => {
    if (confirm(t('admin.reset') + '?')) {
      HospitalStorage.clearContentOverride();
      await HospitalApp.refreshLanguage();
      loadContentForm();
    }
  });

  window.addEventListener('hospital:refresh', () => {
    I18n.applyDOM();
    if (!adminView.hidden) {
      renderAppointments();
      loadContentForm();
    }
  });
});

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
