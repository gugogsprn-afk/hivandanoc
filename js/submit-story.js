const MAX_PROVIDERS = 5;
const MAX_CONDITIONS = 5;
const MAX_IMAGE_MB = 5;

function t(key) {
  return I18n.t(key);
}

function providerRowHtml(required) {
  const reqCls = required ? ' hss-field--req' : '';
  const reqAttr = required ? ' required' : '';
  return `
    <div class="hss-form__row hss-dynamic-row" data-provider-row>
      <label class="hss-field${reqCls}">
        <span data-i18n="pages.submitStory.provider">${t('pages.submitStory.provider')}</span>
        <input type="text" name="provider[]"${reqAttr}>
      </label>
      <label class="hss-field">
        <span data-i18n="pages.submitStory.providerOptional">${t('pages.submitStory.providerOptional')}</span>
        <input type="text" name="providerOptional[]">
      </label>
      <button type="button" class="hss-dynamic-row__remove" aria-label="${t('pages.submitStory.removeRow')}">×</button>
    </div>`;
}

function conditionRowHtml(required) {
  const reqCls = required ? ' hss-field--req' : '';
  const reqAttr = required ? ' required' : '';
  return `
    <div class="hss-form__row hss-dynamic-row" data-condition-row>
      <label class="hss-field${reqCls}">
        <span data-i18n="pages.submitStory.conditionPrimary">${t('pages.submitStory.conditionPrimary')}</span>
        <input type="text" name="condition[]"${reqAttr}>
      </label>
      <label class="hss-field">
        <span data-i18n="pages.submitStory.conditionSecondary">${t('pages.submitStory.conditionSecondary')}</span>
        <input type="text" name="conditionSecondary[]">
      </label>
      <button type="button" class="hss-dynamic-row__remove" aria-label="${t('pages.submitStory.removeRow')}">×</button>
    </div>`;
}

function bindRemoveButtons(container, rowAttr) {
  container.querySelectorAll('.hss-dynamic-row__remove').forEach((btn) => {
    btn.onclick = () => {
      const rows = container.querySelectorAll(`[${rowAttr}]`);
      if (rows.length <= 1) return;
      btn.closest(`[${rowAttr}]`)?.remove();
      updateAddButtons();
    };
  });
}

function updateAddButtons() {
  const provList = document.getElementById('providers-list');
  const condList = document.getElementById('conditions-list');
  const addProv = document.getElementById('add-provider');
  const addCond = document.getElementById('add-condition');
  if (addProv && provList) {
    addProv.hidden = provList.querySelectorAll('[data-provider-row]').length >= MAX_PROVIDERS;
  }
  if (addCond && condList) {
    addCond.hidden = condList.querySelectorAll('[data-condition-row]').length >= MAX_CONDITIONS;
  }
}

function fileMeta(file) {
  if (!file || !file.size) return null;
  return { name: file.name, size: file.size, type: file.type };
}

function validateImage(input) {
  if (!input.files?.length) return input.required ? t('pages.submitStory.errImageRequired') : '';
  const file = input.files[0];
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return t('pages.submitStory.errImageSize', { max: MAX_IMAGE_MB });
  }
  return '';
}

function collectFormData(form) {
  const fd = new FormData(form);
  const providers = [];
  const providerNames = fd.getAll('provider[]');
  const providerOptional = fd.getAll('providerOptional[]');
  providerNames.forEach((name, i) => {
    if (name?.trim()) {
      providers.push({ name: name.trim(), secondary: (providerOptional[i] || '').trim() });
    }
  });

  const conditions = [];
  const conditionNames = fd.getAll('condition[]');
  const conditionSecondary = fd.getAll('conditionSecondary[]');
  conditionNames.forEach((name, i) => {
    if (name?.trim()) {
      conditions.push({ primary: name.trim(), secondary: (conditionSecondary[i] || '').trim() });
    }
  });

  return {
    firstName: fd.get('firstName')?.trim(),
    lastName: fd.get('lastName')?.trim(),
    email: fd.get('email')?.trim(),
    phone: fd.get('phone')?.trim(),
    country: fd.get('country')?.trim() || '',
    state: fd.get('state')?.trim() || '',
    city: fd.get('city')?.trim(),
    dob: fd.get('dob')?.trim(),
    providers,
    conditions,
    story: fd.get('story')?.trim(),
    images: ['image1', 'image2', 'image3'].map((n) => fileMeta(form.querySelector(`[name="${n}"]`)?.files?.[0])).filter(Boolean),
    video1: fd.get('video1')?.trim() || '',
    video2: fd.get('video2')?.trim() || '',
    consentPhoto: !!fd.get('consentPhoto'),
    consentPrivacy: !!fd.get('consentPrivacy'),
    role: fd.get('role')
  };
}

function showFieldError(input, message) {
  const field = input.closest('.hss-field, .hss-check, .hss-radio');
  if (!field) return;
  field.classList.toggle('hss-field--error', !!message);
  let err = field.querySelector('.hss-field__error');
  if (message) {
    if (!err) {
      err = document.createElement('span');
      err.className = 'hss-field__error';
      field.appendChild(err);
    }
    err.textContent = message;
  } else if (err) {
    err.remove();
  }
}

function validateForm(form) {
  let ok = true;
  form.querySelectorAll('.hss-field__error').forEach((e) => e.remove());
  form.querySelectorAll('.hss-field--error').forEach((f) => f.classList.remove('hss-field--error'));

  form.querySelectorAll('[required]').forEach((input) => {
    if (input.type === 'checkbox' || input.type === 'radio') return;
    if (!input.checkValidity()) {
      showFieldError(input, t('pages.submitStory.errRequired'));
      ok = false;
    }
  });

  ['image1', 'image2', 'image3'].forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    const err = validateImage(input);
    if (err) {
      showFieldError(input, err);
      ok = false;
    }
  });

  if (!form.querySelector('[name="consentPhoto"]:checked')) {
    const el = form.querySelector('[name="consentPhoto"]');
    showFieldError(el, t('pages.submitStory.errConsent'));
    ok = false;
  }
  if (!form.querySelector('[name="consentPrivacy"]:checked')) {
    const el = form.querySelector('[name="consentPrivacy"]');
    showFieldError(el, t('pages.submitStory.errConsent'));
    ok = false;
  }
  if (!form.querySelector('[name="role"]:checked')) {
    const el = form.querySelector('[name="role"]');
    showFieldError(el, t('pages.submitStory.errRole'));
    ok = false;
  }

  return ok;
}

function initDynamicRows() {
  const provList = document.getElementById('providers-list');
  const condList = document.getElementById('conditions-list');

  document.getElementById('add-provider')?.addEventListener('click', () => {
    if (provList.querySelectorAll('[data-provider-row]').length >= MAX_PROVIDERS) return;
    provList.insertAdjacentHTML('beforeend', providerRowHtml(false));
    bindRemoveButtons(provList, 'data-provider-row');
    updateAddButtons();
  });

  document.getElementById('add-condition')?.addEventListener('click', () => {
    if (condList.querySelectorAll('[data-condition-row]').length >= MAX_CONDITIONS) return;
    condList.insertAdjacentHTML('beforeend', conditionRowHtml(false));
    bindRemoveButtons(condList, 'data-condition-row');
    updateAddButtons();
  });

  bindRemoveButtons(provList, 'data-provider-row');
  bindRemoveButtons(condList, 'data-condition-row');
  updateAddButtons();
}

function initDobMask() {
  const dob = document.querySelector('[name="dob"]');
  if (!dob) return;
  dob.addEventListener('input', () => {
    let v = dob.value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    else if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    dob.value = v;
  });
}

function resetDynamicLists() {
  const provList = document.getElementById('providers-list');
  const condList = document.getElementById('conditions-list');
  if (provList) {
    provList.innerHTML = providerRowHtml(true);
    bindRemoveButtons(provList, 'data-provider-row');
  }
  if (condList) {
    condList.innerHTML = conditionRowHtml(true);
    bindRemoveButtons(condList, 'data-condition-row');
  }
  updateAddButtons();
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('submit-story-form');
  if (!form) return;

  await HospitalApp.init();
  I18n.applyDOM();
  initDynamicRows();
  initDobMask();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      const firstErr = form.querySelector('.hss-field--error');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const record = collectFormData(form);
    HospitalStorage.addPatientStory(record);

    const msg = document.getElementById('story-success');
    msg.hidden = false;
    form.reset();
    resetDynamicLists();
    window.scrollTo({ top: msg.offsetTop - 120, behavior: 'smooth' });
  });

  window.addEventListener('hospital:refresh', () => {
    I18n.applyDOM();
  });
});
