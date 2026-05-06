/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
const API = 'https://coinhatfeeds.onrender.com/api';

let state = {
  lang: 'pt',
  memeData: [],
  currentPair: null,
  currentTf: 'm5',
  activeTab: 'news',
  cache: {},
  fetched: {}
};

/* ═══════════════════════════════════════
   I18N
═══════════════════════════════════════ */
const i18n = {
  pt: {
    kb: [],
    def: 'Não entendi'
  }
};

function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

function setLang(lang) {
  state.lang = lang;
  state.fetched = {};
}

/* ═══════════════════════════════════════
   FETCH GENERIC
═══════════════════════════════════════ */
async function apiFetch(endpoint, timeout = 8000) {
  try {
    const res = await fetch(`${API}/${endpoint}`, {
      signal: AbortSignal.timeout(timeout)
    });
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    return data.data || data || [];
  } catch (e) {
    console.error('API Error:', e);
    return null;
  }
}

/* ═══════════════════════════════════════
   NEWS
═══════════════════════════════════════ */
async function fetchNews() {
  const data = await apiFetch(`news?lang=${state.lang}`);
  if (data) return data;
  return fetchNewsFallback();
}

async function fetchNewsFallback() {
  return [];
}

/* ═══════════════════════════════════════
   RENDER FUNCTIONS
═══════════════════════════════════════ */
function showLoading() {
  const container = document.querySelector('#news-container') ||
                   document.querySelector('.news-list') ||
                   document.querySelector('main');
  if (container) {
    container.innerHTML = '<div style="padding:20px;text-align:center">Carregando notícias...</div>';
  }
}

function renderNews(data) {
  const container = document.querySelector('#news-container') ||
                   document.querySelector('.news-list') ||
                   document.querySelector('main');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center">Nenhuma notícia encontrada</div>';
    return;
  }

  container.innerHTML = data.map(news => `
    <div class="news-card" style="border:1px solid #333;padding:15px;margin:10px;border-radius:8px">
      <a href="${news.url}" target="_blank" style="text-decoration:none;color:inherit">
        <h3 style="margin:0 0 8px 0;font-size:16px">${news.title}</h3>
        <p style="margin:0 0 8px 0;font-size:14px;opacity:
