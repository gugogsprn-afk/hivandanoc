/**
 * Локальное хранилище заявок и контента (демо без сервера).
 * Для продакшена замените на API бэкенда.
 */
const HospitalStorage = (function () {
  const KEYS = {
    appointments: 'gkb_appointments',
    patientStories: 'gkb_patient_stories',
    content: 'gkb_content_override',
    session: 'gkb_admin_session'
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function sanitizeText(str, maxLen) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLen || 500).replace(/[<>]/g, '');
  }

  function canSubmitForm(key, cooldownMs) {
    try {
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      const wait = cooldownMs || 30000;
      if (Date.now() - last < wait) return false;
      localStorage.setItem(key, String(Date.now()));
      return true;
    } catch {
      return true;
    }
  }

  return {
    getAppointments() {
      return read(KEYS.appointments, []);
    },

    addAppointment(record) {
      if (!canSubmitForm('gkb_last_appointment', 30000)) {
        throw new Error('rate_limit');
      }
      const list = read(KEYS.appointments, []);
      const entry = {
        id: 'apt-' + Date.now(),
        status: 'new',
        createdAt: new Date().toISOString(),
        patientName: sanitizeText(record.patientName, 120),
        phone: sanitizeText(record.phone, 40),
        email: sanitizeText(record.email, 120),
        departmentId: sanitizeText(record.departmentId, 40),
        doctorId: sanitizeText(record.doctorId, 40),
        date: sanitizeText(record.date, 20),
        time: sanitizeText(record.time, 20),
        comment: sanitizeText(record.comment, 1000)
      };
      list.unshift(entry);
      write(KEYS.appointments, list);
      return entry;
    },

    updateAppointment(id, patch) {
      const list = read(KEYS.appointments, []);
      const idx = list.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch };
      write(KEYS.appointments, list);
      return list[idx];
    },

    deleteAppointment(id) {
      const list = read(KEYS.appointments, []).filter((a) => a.id !== id);
      write(KEYS.appointments, list);
    },

    getPatientStories() {
      return read(KEYS.patientStories, []);
    },

    addPatientStory(record) {
      if (!canSubmitForm('gkb_last_story', 60000)) {
        throw new Error('rate_limit');
      }
      const list = read(KEYS.patientStories, []);
      const entry = {
        id: 'story-' + Date.now(),
        status: 'new',
        createdAt: new Date().toISOString(),
        ...record
      };
      list.unshift(entry);
      write(KEYS.patientStories, list);
      return entry;
    },

    deletePatientStory(id) {
      const list = read(KEYS.patientStories, []).filter((s) => s.id !== id);
      write(KEYS.patientStories, list);
    },

    getContentOverride() {
      return read(KEYS.content, null);
    },

    setContentOverride(data) {
      write(KEYS.content, data);
    },

    clearContentOverride() {
      localStorage.removeItem(KEYS.content);
    },

    login(password) {
      const expected = 'admin123';
      if (password === expected) {
        write(KEYS.session, { ok: true, at: Date.now() });
        return true;
      }
      return false;
    },

    isLoggedIn() {
      const s = read(KEYS.session, null);
      if (!s || !s.ok) return false;
      const day = 24 * 60 * 60 * 1000;
      return Date.now() - s.at < day;
    },

    logout() {
      localStorage.removeItem(KEYS.session);
    }
  };
})();
