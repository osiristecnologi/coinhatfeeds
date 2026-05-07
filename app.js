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
  fetched: {},
  drawerOpen: false
};

/* ═══════════════════════════════════════
   I18N
═══════════════════════════════════════ */
const i18n = {
  pt: {
    search: 'Buscar token...',
    news: 'Notícias',
    presales: 'Pré-vendas',
    alpha: 'Alpha',
    airdrops: 'Airdrops',
    sponsors: 'Parceiros',
    refresh: 'Atualizar',
    memecoins_title: 'Memecoins em Destaque',
    memecoins_sub: 'Cotações e gráficos em tempo real',
    vol: 'Vol 24h',
    liq: 'Liquidez',
    mc: 'Mkt Cap',
    contract: 'Contrato',
    chart_btn: 'Ver Gráfico Avançado',
    loading: 'Carregando...',
    no_data: 'Nenhum dado encontrado',
    live: 'LIVE',
    kb: [
      {
        k: ['preço', 'price', 'cotação'],
        r: 'Consulte o preço em tempo real no card da memecoin.'
      },
      {
        k: ['airdrop', 'grátis'],
        r: 'Confira a aba Airdrops no menu ☰.'
      },
      {
        k: ['alpha', 'call'],
        r: 'Aba Alpha traz calls exclusivas.'
      },
      {
        k: ['presale', 'pré-venda'],
        r: 'Veja as pré-vendas na aba Pré-vendas.'
      }
    ],
    def: 'Não entendi. Pergunte sobre preço, alpha, airdrop ou pré-venda.'
  }
};

function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

/* ═══════════════════════════════════════
   INTERFACE LANG
═══════════════════════════════════════ */
function updateInterfaceLang() {

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.placeholder = t('search');
  }

  const map = {
    'dt-news': 'news',
    'dt-presales': 'presales',
    'dt-alpha': 'alpha',
    'dt-airdrops': 'airdrops',
    'dt-sponsors': 'sponsors',
    'nt-refresh': 'refresh',
    'nt-vol': 'vol',
    'nt-liq': 'liq',
    'nt-mc': 'mc',
    'nt-contract': 'contract',
    'dexBtnLabel': 'chart_btn'
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  const titleEl = document.querySelector('.section-title');
  if (titleEl) {
    titleEl.innerHTML = `🔥 ${t('memecoins_title')}`;
  }

  const subEl = document.querySelector('.section-sub');
  if (subEl) {
    subEl.innerHTML = `
      ${t('memecoins_sub')}
      ·
      <span class="live">
        <span class="live-dot"></span>
        ${t('live')}
      </span>
    `;
  }
}

function setLang(lang, el) {
  state.lang = lang;
  state.fetched = {};

  document.querySelectorAll('.lang-opt')
    .forEach(o => o.classList.remove('selected'));

  if (el) el.classList.add('selected');

  updateInterfaceLang();
  closeLang();
  loadTab(state.activeTab, true);
}

function toggleLang() {
  document.getElementById('langMenu')
    ?.classList.toggle('active');
}

function closeLang() {
  document.getElementById('langMenu')
    ?.classList.remove('active');
}

/* ═══════════════════════════════════════
   DRAWER
═══════════════════════════════════════ */
function openDrawer() {
  document.getElementById('drawer')
    ?.classList.add('open');

  document.getElementById('overlay')
    ?.classList.add('active');

  state.drawerOpen = true;

  loadTab(state.activeTab);
}

function closeDrawer() {
  document.getElementById('drawer')
    ?.classList.remove('open');

  document.getElementById('overlay')
    ?.classList.remove('active');

  state.drawerOpen = false;
}

function closeAll() {
  closeDrawer();
  closeModal();
  closeLang();
  closeResults();
}

function switchDrawerTab(tab, el) {

  document.querySelectorAll('.dtab')
    .forEach(t => t.classList.remove('active'));

  el.classList.add('active');

  state.activeTab = tab;

  loadTab(tab);
}

/* ═══════════════════════════════════════
   API FETCH
═══════════════════════════════════════ */
async function apiFetch(endpoint, timeout = 8000) {

  try {

    const res = await fetch(`${API}/${endpoint}`, {
      signal: AbortSignal.timeout(timeout)
    });

    if (!res.ok) {
      throw new Error('API Error');
    }

    const data = await res.json();

    return data.data || data || [];

  } catch (e) {

    console.error('API Error:', e);

    return [];

  }
}

/* ═══════════════════════════════════════
   LOAD TAB
═══════════════════════════════════════ */
async function loadTab(tab, force = false) {

  const cacheKey = `${tab}_${state.lang}`;

  if (state.fetched[cacheKey] && !force) {
    return renderTab(tab, state.cache[cacheKey]);
  }

  showDrawerLoading();

  let data = [];

  try {

    data = await apiFetch(`${tab}?lang=${state.lang}`);

  } catch (err) {

    console.error(err);

  }

  state.cache[cacheKey] = data;
  state.fetched[cacheKey] = true;

  renderTab(tab, data);
}

function showDrawerLoading() {

  const container = document.getElementById('drawerBody');

  if (!container) return;

  container.innerHTML = `
    <div class="loading-box">
      ${t('loading')}
    </div>
  `;
}

/* ═══════════════════════════════════════
   RENDER TAB
═══════════════════════════════════════ */
function renderTab(tab, data) {

  const container = document.getElementById('drawerBody');

  if (!container) return;

  if (!data || !data.length) {

    container.innerHTML = `
      <div class="empty-state">
        📭 ${t('no_data')}
      </div>
    `;

    return;
  }

  switch (tab) {

    case 'news':
      renderNews(data, container);
      break;

    case 'presales':
      renderPresales(data, container);
      break;

    case 'alpha':
      renderAlpha(data, container);
      break;

    case 'airdrops':
      renderAirdrops(data, container);
      break;

    case 'sponsors':
      renderSponsors(data, container);
      break;
  }
}

/* ═══════════════════════════════════════
   RENDERS
═══════════════════════════════════════ */
function renderNews(data, container) {

  container.innerHTML = data.map(news => `
    <div class="news-card"
      onclick="window.open('${news.url || '#'}','_blank')">

      ${news.image ? `
        <img class="news-img"
          src="${news.image}"
          onerror="this.style.display='none'">
      ` : ''}

      <div class="news-info">

        <div class="news-source">
          ${news.source || 'CoinHat'}
        </div>

        <div class="news-title">
          ${news.title || ''}
        </div>

      </div>
    </div>
  `).join('');
}

function renderPresales(data, container) {

  container.innerHTML = data.map(p => `
    <div class="presale-card">

      <div class="presale-name">
        ${p.name || 'Unknown'}
      </div>

      <div class="presale-chain">
        ${p.chain || 'BSC'}
      </div>

    </div>
  `).join('');
}

function renderAlpha(data, container) {

  container.innerHTML = data.map(a => `
    <div class="alpha-card">

      <div class="alpha-title">
        ${a.title || 'Alpha'}
      </div>

      <div class="alpha-body">
        ${a.body || a.description || ''}
      </div>

    </div>
  `).join('');
}

function renderAirdrops(data, container) {

  container.innerHTML = data.map(a => `
    <div class="airdrop-card">

      <div class="airdrop-name">
        ${a.name || 'Airdrop'}
      </div>

      <div class="airdrop-reward">
        ${a.reward || '???'}
      </div>

    </div>
  `).join('');
}

function renderSponsors(data, container) {

  container.innerHTML = data.map(s => `
    <div class="sponsor-card"
      onclick="window.open('${s.url || '#'}','_blank')">

      <div class="sponsor-name">
        ${s.name || 'Sponsor'}
      </div>

    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   MEMECOINS
═══════════════════════════════════════ */
async function loadMemecoins() {

  const container = document.getElementById('memeGrid');

  if (!container) return;

  container.innerHTML = `
    <div class="loading-box">
      Carregando memecoins...
    </div>
  `;

  try {

    const boostRes = await fetch(
      'https://api.dexscreener.com/token-boosts/latest/v1'
    );

    const boosts = await boostRes.json();

    const selected = boosts.slice(0, 12);

    const pairsPromises = selected.map(async token => {

      try {

        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/search?q=${token.tokenAddress}`
        );

        const data = await res.json();

        return data.pairs?.[0] || null;

      } catch {

        return null;

      }

    });

    const pairs = await Promise.all(pairsPromises);

    const validPairs = pairs.filter(Boolean);

    state.memeData = validPairs;

    renderMemes(validPairs);

  } catch (err) {

    console.error(err);

    container.innerHTML = `
      <div class="error-box">
        Erro ao carregar memecoins
      </div>
    `;
  }
}

function renderMemes(data) {

  const container = document.getElementById('memeGrid');

  if (!container) return;

  if (!data.length) {

    container.innerHTML = `
      <div class="error-box">
        Nenhuma memecoin encontrada
      </div>
    `;

    return;
  }

  container.innerHTML = data.map((p, i) => {

    const price = parseFloat(p.priceUsd || 0);
    const change = p.priceChange?.h24 || 0;
    const vol = p.volume?.h24 || 0;
    const liq = p.liquidity?.usd || 0;

    return `
      <div class="meme-card"
        onclick='openToken(${JSON.stringify(p).replace(/'/g, "&apos;")})'>

        <div class="meme-top">

          <img
            class="meme-logo"
            src="${p.info?.imageUrl || ''}"
            onerror="this.style.display='none'"
          >

          <div>

            <div class="meme-name">
              ${p.baseToken?.name || 'Unknown'}
            </div>

            <div class="meme-sym">
              ${p.baseToken?.symbol || '???'}
            </div>

          </div>

          ${i < 3
            ? '<span class="meme-badge badge-hot">HOT</span>'
            : ''
          }

        </div>

        <div>

          <span class="meme-price">
            $${price < 0.01
              ? price.toFixed(8)
              : price.toFixed(4)}
          </span>

          <span class="meme-chg ${change >= 0 ? 'pos' : 'neg'}">
            ${change >= 0 ? '+' : ''}
            ${change.toFixed(2)}%
          </span>

        </div>

        <div class="meme-stats">

          <div class="meme-stat">
            Vol
            <span>${fmt(vol)}</span>
          </div>

          <div class="meme-stat">
            Liq
            <span>${fmt(liq)}</span>
          </div>

        </div>

      </div>
    `;

  }).join('');
}

/* ═══════════════════════════════════════
   TOKEN MODAL
═══════════════════════════════════════ */
function openToken(pair) {

  state.currentPair = pair;

  document.getElementById('tokenModal')
    ?.classList.add('active');

  document.getElementById('m-logo').src =
    pair.info?.imageUrl || '';

  document.getElementById('m-name').textContent =
    pair.baseToken?.name || 'Unknown';

  document.getElementById('m-sym').textContent =
    pair.baseToken?.symbol || '???';

  document.getElementById('m-price').textContent =
    '$' + (parseFloat(pair.priceUsd || 0)).toFixed(6);

  const change = pair.priceChange?.h24 || 0;

  const chgEl = document.getElementById('m-chg');

  chgEl.textContent =
    `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  chgEl.className =
    `meme-chg ${change >= 0 ? 'pos' : 'neg'}`;

  document.getElementById('m-vol').textContent =
    fmt(pair.volume?.h24 || 0);

  document.getElementById('m-liq').textContent =
    fmt(pair.liquidity?.usd || 0);

  document.getElementById('m-mc').textContent =
    fmt(pair.marketCap || pair.fdv || 0);

  document.getElementById('m-addr').textContent =
    pair.baseToken?.address || '—';

  loadChart();
}

function closeModal() {

  document.getElementById('tokenModal')
    ?.classList.remove('active');
}

function loadChart() {

  const chart = document.getElementById('m-chart');

  if (!chart || !state.currentPair) return;

  chart.innerHTML = `
    <iframe
      src="https://dexscreener.com/${state.currentPair.chainId}/${state.currentPair.pairAddress}?embed=1&theme=dark"
      style="width:100%;height:100%;border:none;">
    </iframe>
  `;
}

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
let searchTimeout;

function onSearch(q) {

  clearTimeout(searchTimeout);

  if (q.length < 2) {
    closeResults();
    return;
  }

  searchTimeout = setTimeout(async () => {

    try {

      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${q}`
      );

      const data = await res.json();

      renderSearch(data.pairs || []);

    } catch (err) {

      console.error(err);

    }

  }, 400);
}

function renderSearch(pairs) {

  const container =
    document.getElementById('search-results');

  if (!container) return;

  if (!pairs.length) {

    container.innerHTML = `
      <div class="empty-state">
        Nenhum resultado
      </div>
    `;

    container.classList.add('active');

    return;
  }

  container.innerHTML = pairs.slice(0, 8).map(p => `
    <div class="sr-item"
      onclick='openToken(${JSON.stringify(p).replace(/'/g, "&apos;")});closeResults()'>

      <div class="sr-name">
        ${p.baseToken?.name || 'Unknown'}
      </div>

      <div class="sr-price">
        $${parseFloat(p.priceUsd || 0).toFixed(6)}
      </div>

    </div>
  `).join('');

  container.classList.add('active');
}

function closeResults() {

  document.getElementById('search-results')
    ?.classList.remove('active');
}

/* ═══════════════════════════════════════
   CHATBOT
═══════════════════════════════════════ */
function toggleChat() {

  const win = document.getElementById('chatWindow');

  if (!win) return;

  win.classList.toggle('open');

  if (
    win.classList.contains('open') &&
    document.getElementById('chatMessages').children.length === 0
  ) {

    addBotMsg(
      'Olá! Sou o CryptoBot 🤖'
    );

    showSuggestions();
  }
}

function addBotMsg(text) {

  const msgs = document.getElementById('chatMessages');

  if (!msgs) return;

  const div = document.createElement('div');

  div.className = 'chat-msg bot';

  div.textContent = text;

  msgs.appendChild(div);

  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {

  const msgs = document.getElementById('chatMessages');

  if (!msgs) return;

  const div = document.createElement('div');

  div.className = 'chat-msg user';

  div.textContent = text;

  msgs.appendChild(div);

  msgs.scrollTop = msgs.scrollHeight;
}

function showSuggestions() {

  const sugs = document.getElementById('chatSugs');

  if (!sugs) return;

  const sugList = [
    'Preço BTC',
    'Airdrop ativo',
    'Alpha call',
    'Pré-venda'
  ];

  sugs.innerHTML = sugList.map(s => `
    <button
      class="chat-sug"
      onclick="sendChat('${s}')">
      ${s}
    </button>
  `).join('');
}

function sendChat(preset) {

  const input = document.getElementById('chatInput');

  const msg = preset || input.value.trim();

  if (!msg) return;

  addUserMsg(msg);

  input.value = '';

  setTimeout(() => {

    addBotMsg(getBotReply(msg));

  }, 500);
}

function getBotReply(msg) {

  const kb = (i18n[state.lang] || i18n.pt).kb;

  for (const item of kb) {

    if (
      item.k.some(k =>
        msg.toLowerCase().includes(k)
      )
    ) {

      return item.r;

    }
  }

  return (i18n[state.lang] || i18n.pt).def;
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
const fmt = n =>

  !n ? '—'

  : n >= 1e9
    ? '$' + (n / 1e9).toFixed(2) + 'B'

  : n >= 1e6
    ? '$' + (n / 1e6).toFixed(2) + 'M'

  : n >= 1e3
    ? '$' + (n / 1e3).toFixed(2) + 'K'

  : '$' + Number(n).toFixed(2);

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  updateInterfaceLang();

  loadTab('news');

  loadMemecoins();

  setInterval(loadMemecoins, 30000);

  document.addEventListener('click', e => {

    if (!e.target.closest('.lang-dropdown')) {
      closeLang();
    }

    if (!e.target.closest('.search-wrap')) {
      closeResults();
    }

  });

});
