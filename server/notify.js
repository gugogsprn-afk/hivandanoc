const nodemailer = require('nodemailer');

function env(name, fallback = '') {
  return (process.env[name] || fallback).trim();
}

function isEmailConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS') && env('NOTIFY_EMAIL'));
}

function isTelegramConfigured() {
  return Boolean(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID'));
}

function getMailer() {
  const port = Number(env('SMTP_PORT', '587'));
  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: env('SMTP_SECURE', 'false') === 'true',
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS')
    }
  });
}

async function sendEmail({ subject, text, html }) {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, reason: 'SMTP not configured' };
  }
  const to = env('NOTIFY_EMAIL');
  const from = env('MAIL_FROM', env('SMTP_USER'));
  await getMailer().sendMail({ from, to, subject, text, html: html || undefined });
  return { ok: true };
}

async function sendTelegram(text) {
  if (!isTelegramConfigured()) {
    return { ok: false, skipped: true, reason: 'Telegram not configured' };
  }
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHAT_ID');
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram HTTP ${res.status}`);
  }
  return { ok: true };
}

function linesFromObject(obj, skip = new Set(['type'])) {
  return Object.entries(obj)
    .filter(([k, v]) => !skip.has(k) && v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `${k}: ${val}`;
    })
    .join('\n');
}

async function notifyForm({ type, title, payload }) {
  const subject = `[Առողջ ողնաշար] ${title}`;
  const body = `${title}\n\n${linesFromObject(payload)}\n\nВремя: ${new Date().toLocaleString('ru-RU')}`;
  const results = { email: null, telegram: null };

  try {
    results.email = await sendEmail({ subject, text: body });
  } catch (err) {
    results.email = { ok: false, error: err.message };
    console.error('[email]', err.message);
  }

  try {
    results.telegram = await sendTelegram(`🔔 ${title}\n\n${linesFromObject(payload)}`);
  } catch (err) {
    results.telegram = { ok: false, error: err.message };
    console.error('[telegram]', err.message);
  }

  const sent = results.email?.ok || results.telegram?.ok;
  const configured = isEmailConfigured() || isTelegramConfigured();

  return {
    ok: sent,
    configured,
    emailEnabled: isEmailConfigured(),
    telegramEnabled: isTelegramConfigured(),
    results
  };
}

module.exports = {
  notifyForm,
  isEmailConfigured,
  isTelegramConfigured
};
