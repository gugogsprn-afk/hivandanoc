/** Отправка форм на сервер (email + Telegram). Работает только с node server/index.js */
const FormApi = (function () {
  async function submit(endpoint, data) {
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok && json.ok !== false, status: res.status, ...json };
    } catch (err) {
      return { ok: false, offline: true, error: err.message };
    }
  }

  return {
    submitAppointment: (data) => submit('appointment', data),
    submitContact: (data) => submit('contact', data),
    submitStory: (data) => submit('story', data)
  };
})();
