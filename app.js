/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : '/api';

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
function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

function setLang(lang) {
  state.lang = lang;
  state.fetched = {}; // força reload
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
    return data.data || [];
  } catch {
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
  // fallback IA (o seu já tava bom)
  return [];
}

/* ═══════════════════════════════════════
   TABS LOADER
═══════════════════════════════════════ */
async function loadTab(tab, force = false) {
  if (state.fetched[tab] && !force) {
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

  state.cache[tab] = data;
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
    // fallback mantém
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
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${q}`
    );

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
  !n ? '—' :
  n >= 1e9 ? '$' + (n/1e9).toFixed(2)+'B' :
  n >= 1e6 ? '$' + (n/1e6).toFixed(2)+'M' :
  n >= 1e3 ? '$' + (n/1e3).toFixed(2)+'K' :
  '$' + n.toFixed(4);

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
setLang('pt');
loadMemecoins();
setInterval(loadMemecoins, 30000);
