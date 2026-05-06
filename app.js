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
                   document.querySelector('main') ||
                   document.body;
  if (container) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:#fff;font-family:Arial">Carregando notícias...</div>';
  }
}

function renderNews(data) {
  const container = document.querySelector('#news-container') ||
                   document.querySelector('.news-list') ||
                   document.querySelector('main') ||
                   document.body;
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:#fff;font-family:Arial">Nenhuma notícia encontrada</div>';
    return;
  }

  container.innerHTML = data.map(news => `
    <div class="news-card" style="border:1px solid #333;padding:15px;margin:10px;border-radius:8px;background:#1a1a1a;font-family:Arial">
      <a href="${news.url}" target="_blank" style="text-decoration:none;color:#fff">
        <h3 style="margin:0 0 8px 0;font-size:16px;color:#fff">${news.title}</h3>
        <p style="margin:0 0 8px 0;font-size:14px;opacity:0.8;color:#ccc">${news.summary || ''}</p>
        <span style="font-size:12px;opacity:0.6;color:#888">${news.source} • ${new Date(news.publishedAt).toLocaleDateString('pt-BR')}</span>
      </a>
    </div>
  `).join('');
}

function renderMemes(data) {
  const container = document.querySelector('#memes-container') || document.querySelector('.memes-list');
  if (!container) return;
  container.innerHTML = data.map(m => `<div style="color:#fff">${m.baseToken?.symbol || 'N/A'}</div>`).join('');
}

function renderPresales(data) { renderNews(data); }
function renderAlpha(data) { renderNews(data); }
function renderAirdrops(data) { renderNews(data); }
function renderSponsors(data) { renderNews(data); }
function renderSearch(data) {}

const FALLBACK = [];

/* ═══════════════════════════════════════
   TABS LOADER
═══════════════════════════════════════ */
async function loadTab(tab, force = false) {
  if (state.fetched[tab] &&!force) {
    return renderTab(tab, state.cache[tab]);
  }

  showLoading();

  let data = [];

  switch (tab) {
    case 'news':
      data = await fetchNews();
      break;
    case 'presales':
      data = await apiFetch('presales');
      break;
    case 'alpha':
      data = await apiFetch('alpha');
      break;
    case 'airdrops':
      data = await apiFetch('airdrops');
      break;
    case 'sponsors':
      data = await apiFetch('sponsors');
      break;
  }

  state.cache[tab] = data || [];
  state.fetched[tab] = true;

  renderTab(tab, data);
}

/* ═══════════════════════════════════════
   RENDER CONTROLLER
═══════════════════════════════════════ */
function renderTab(tab, data) {
  const map = {
    news: renderNews,
    presales: renderPresales,
    alpha: renderAlpha,
    airdrops: renderAirdrops,
    sponsors: renderSponsors
  };

  map[tab]?.(data);
}

/* ═══════════════════════════════════════
   MEMECOINS
═══════════════════════════════════════ */
async function loadMemecoins() {
  if (!state.memeData.length) {
    state.memeData = FALLBACK;
    renderMemes(state.memeData);
  }

  try {
    const res = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
    const boosts = await res.json();
    const pairs = boosts.slice(0, 10);

    if (pairs.length) {
      state.memeData = pairs;
      renderMemes(pairs);
    }
  } catch {
    // mantém fallback
  }
}

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
let searchTimeout;

function onSearch(q) {
  clearTimeout(searchTimeout);
  if (q.length < 2) return;

  searchTimeout = setTimeout(async () => {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
    const data = await res.json();
    renderSearch(data.pairs || []);
  }, 400);
}

/* ═══════════════════════════════════════
   CHATBOT
═══════════════════════════════════════ */
function getBotReply(msg) {
  const kb = (i18n[state.lang] || i18n.pt).kb;
  for (const item of kb) {
    if (item.k.some(k => msg.toLowerCase().includes(k))) {
      return item.r;
    }
  }
  return (i18n[state.lang] || i18n.pt).def;
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
const fmt = n =>
!n? '—' :
  n >= 1e9? '$' + (n/1e9).toFixed(2)+'B' :
  n >= 1e6? '$' + (n/1e6).toFixed(2)+'M' :
  n >= 1e3? '$' + (n/1e3).toFixed(2)+'K' :
  '$' + n.toFixed(4);

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setLang('pt');
  loadTab('news');
  loadMemecoins();
  setInterval(loadMemecoins, 30000);
});
