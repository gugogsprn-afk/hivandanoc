/**
 * Machine translation for CMS (Armenian → Russian / English).
 * Uses MyMemory free API; chunks long text to respect size limits.
 */

const CHUNK_MAX = 450;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateChunk(text, from, to) {
  const q = encodeURIComponent(text);
  const pair = `${from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=${pair}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Translation HTTP ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || data?.responseStatus === 403) {
    throw new Error(data?.responseDetails || 'Translation unavailable');
  }
  return translated;
}

async function translateText(text, from, to) {
  const input = String(text || '').trim();
  if (!input) return '';
  if (from === to) return input;

  const parts = input.split(/(\n+)/);
  const out = [];
  for (const part of parts) {
    if (!part) continue;
    if (/^\n+$/.test(part)) {
      out.push(part);
      continue;
    }
    if (part.length <= CHUNK_MAX) {
      out.push(await translateChunk(part, from, to));
      await sleep(120);
      continue;
    }
    const sentences = part.match(/[^.!?]+[.!?]*/g) || [part];
    let buf = '';
    for (const sentence of sentences) {
      if ((buf + sentence).length > CHUNK_MAX && buf) {
        out.push(await translateChunk(buf.trim(), from, to));
        await sleep(120);
        buf = sentence;
      } else {
        buf += sentence;
      }
    }
    if (buf.trim()) {
      out.push(await translateChunk(buf.trim(), from, to));
      await sleep(120);
    }
  }
  return out.join('');
}

async function translateFromArmenian(text) {
  const hy = String(text || '').trim();
  if (!hy) return { hy: '', ru: '', en: '' };
  const [ru, en] = await Promise.all([
    translateText(hy, 'hy', 'ru').catch((err) => {
      console.warn('[translate] hy→ru failed:', err.message);
      return hy;
    }),
    translateText(hy, 'hy', 'en').catch((err) => {
      console.warn('[translate] hy→en failed:', err.message);
      return hy;
    })
  ]);
  return { hy, ru, en };
}

module.exports = { translateText, translateFromArmenian };
