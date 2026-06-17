function sanitizeString(val, max = 5000) {
  if (val == null) return '';
  return String(val).trim().slice(0, max);
}

function sanitizeEmail(val) {
  const s = sanitizeString(val, 254).toLowerCase();
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return '';
  return s;
}

function sanitizePhone(val) {
  return sanitizeString(val, 40).replace(/[^\d+\s()\-]/g, '');
}

function parseLangFields(body, fields) {
  const out = {};
  for (const field of fields) {
    for (const lang of ['hy', 'ru', 'en']) {
      const key = `${field}_${lang}`;
      if (body[key] !== undefined) out[key] = sanitizeString(body[key], 20000);
    }
  }
  return out;
}

function validateLead(body) {
  const name = sanitizeString(body.name || body.patientName, 200);
  const phone = sanitizePhone(body.phone);
  if (!name || !phone) {
    return { ok: false, error: 'Name and phone are required' };
  }
  return {
    ok: true,
    data: {
      name,
      phone,
      email: sanitizeEmail(body.email),
      doctor_id: sanitizeString(body.doctorId || body.doctor_id, 80),
      service_id: sanitizeString(body.serviceId || body.service_id || body.departmentId, 80),
      department_id: sanitizeString(body.departmentId || body.department_id, 80),
      preferred_date: sanitizeString(body.date || body.preferred_date, 20),
      preferred_time: sanitizeString(body.time || body.preferred_time, 20),
      message: sanitizeString(body.message || body.comment, 5000)
    }
  };
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  parseLangFields,
  validateLead
};
