let appointmentData = null;

function fillAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form || !appointmentData) return;

  const t = (k) => I18n.t(k);
  const deptSelect = form.querySelector('[name="departmentId"]');
  const doctorSelect = form.querySelector('[name="doctorId"]');
  const timeSelect = form.querySelector('[name="time"]');

  const savedDept = deptSelect.value;
  const savedDoctor = doctorSelect.value;

  deptSelect.innerHTML = `<option value="">${t('pages.appointment.department')}</option>`;
  appointmentData.departments.forEach((d) => {
    deptSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
  });

  timeSelect.innerHTML = `<option value="">${t('pages.appointment.time')}</option>`;
  appointmentData.timeSlots.forEach((slot) => {
    timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
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

  const dateInput = form.querySelector('[name="date"]');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const phone = String(fd.get('phone') || '').trim();
    if (phone.length < 6) {
      alert(I18n.t('pages.appointment.phone') || 'Enter a valid phone');
      return;
    }
    try {
      HospitalStorage.addAppointment({
        patientName: fd.get('patientName'),
        phone,
        email: fd.get('email') || '',
        departmentId: fd.get('departmentId'),
        doctorId: fd.get('doctorId') || '',
        date: fd.get('date'),
        time: fd.get('time'),
        comment: fd.get('comment') || ''
      });
    } catch (err) {
      if (err.message === 'rate_limit') {
        alert(I18n.t('pages.appointment.rateLimit') || 'Please wait before submitting again.');
        return;
      }
      throw err;
    }

    const msg = document.getElementById('appointment-success');
    msg.hidden = false;
    form.reset();
    fillAppointmentForm();
    window.scrollTo({ top: msg.offsetTop - 100, behavior: 'smooth' });
  });

  window.addEventListener('hospital:refresh', () => {
    appointmentData = HospitalApp.getData();
    fillAppointmentForm();
    I18n.applyDOM();
  });
});
