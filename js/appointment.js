let appointmentData = null;

function fillAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form || !appointmentData) return;

  const t = (k) => I18n.t(k);
  const deptSelect = form.querySelector('[name="departmentId"]');
  const doctorSelect = form.querySelector('[name="doctorId"]');

  const savedDept = deptSelect.value;
  const savedDoctor = doctorSelect.value;

  deptSelect.innerHTML = `<option value="">${t('pages.appointment.department')}</option>`;
  appointmentData.departments.forEach((d) => {
    deptSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  if (savedDept) deptSelect.value = savedDept;
  updateDoctorOptions();
  if (savedDoctor) doctorSelect.value = savedDoctor;
}

function updateDoctorOptions() {
  const form = document.getElementById('appointment-form');
  if (!form || !appointmentData) return;
  const t = (k) => I18n.t(k);
  const deptSelect = form.querySelector('[name="departmentId"]');
  const doctorSelect = form.querySelector('[name="doctorId"]');
  const deptId = deptSelect.value;
  const saved = doctorSelect.value;

  doctorSelect.innerHTML = `<option value="">${t('common.anyDoctor')}</option>`;
  appointmentData.doctors
    .filter((doc) => doc.departmentId === deptId)
    .forEach((doc) => {
      doctorSelect.innerHTML += `<option value="${doc.id}">${doc.name} — ${doc.role}</option>`;
    });
  if (saved) doctorSelect.value = saved;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  appointmentData = await HospitalApp.init();
  I18n.applyDOM();

  fillAppointmentForm();

  form.querySelector('[name="departmentId"]').addEventListener('change', updateDoctorOptions);

  const params = new URLSearchParams(window.location.search);
  if (params.get('department')) {
    form.querySelector('[name="departmentId"]').value = params.get('department');
    updateDoctorOptions();
  }
  if (params.get('doctor')) {
    const doc = appointmentData.doctors.find((d) => d.id === params.get('doctor'));
    if (doc) {
      form.querySelector('[name="departmentId"]').value = doc.departmentId;
      updateDoctorOptions();
      form.querySelector('[name="doctorId"]').value = doc.id;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const record = {
      patientName: fd.get('patientName'),
      phone: fd.get('phone'),
      email: fd.get('email') || '',
      departmentId: fd.get('departmentId'),
      doctorId: fd.get('doctorId') || '',
      comment: fd.get('comment') || ''
    };

    const msg = document.getElementById('appointment-success');
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    let api = { offline: true };
    try {
      api = typeof FormApi !== 'undefined' ? await FormApi.submitAppointment(record) : { offline: true };
    } catch (err) {
      api = { ok: false, offline: true, error: err?.message || 'Network error' };
    }

    // Only store locally after a confirmed CMS save (avoids 30s rate-limit blocking retries)
    if (api.ok && api.persisted !== false) {
      try {
        HospitalStorage.addAppointment(record);
      } catch {
        /* ignore local rate-limit / quota */
      }
    }

    if (api.ok && (api.cms || api.persisted !== false) && !api.offline) {
      msg.hidden = false;
      msg.textContent =
        typeof I18n !== 'undefined'
          ? I18n.t('pages.appointment.success') || msg.textContent
          : msg.textContent;
      form.reset();
      fillAppointmentForm();
      window.scrollTo({ top: msg.offsetTop - 100, behavior: 'smooth' });
    } else if (api.offline || api.status === 503) {
      alert(
        (typeof I18n !== 'undefined' && I18n.t('pages.appointment.offlineError')) ||
          'Server is temporarily unavailable. Please try again or call us.'
      );
    } else if (api.viaFormSubmit) {
      alert(api.error || api.message || 'Could not send the request. Please try again.');
    } else {
      alert(api.error || 'Could not save the appointment. Please try again or call us.');
    }
    if (submitBtn) submitBtn.disabled = false;
  });

  window.addEventListener('hospital:refresh', () => {
    appointmentData = HospitalApp.getData();
    fillAppointmentForm();
    I18n.applyDOM();
  });
});
