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
    def: 'Não entendi sua pergunta.'
  },

  en: {
    search: 'Search token...',
    news: 'News',
    presales: 'Presales',
    alpha: 'Alpha',
    airdrops: 'Airdrops',
    sponsors: 'Sponsors',
    refresh: 'Refresh',
    memecoins_title: 'Trending Memecoins',
    memecoins_sub: 'Live prices and charts',
    vol: '24h Vol',
    liq: 'Liquidity',
    mc: 'Market Cap',
    contract: 'Contract',
    chart_btn: 'Open Advanced Chart',
    loading: 'Loading...',
    no_data: 'No data found',
    live: 'LIVE',
    def: 'I did not understand.'
  }
};

function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

/* ═══════════════════════════════════════
   LANGUAGE
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

    if (el) {
      el.textContent = t(key);
    }

  });

  const titleEl = document.querySelector('.section-title');

  if (titleEl) {

    titleEl.innerHTML = `
      🔥 ${t('memecoins_title')}
    `;
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

  document.querySelectorAll('.lang-opt')
    .forEach(o => o.classList.remove('selected'));

  if (el) {
    el.classList.add('selected');
  }

  updateInterfaceLang();

  closeLang();
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

/* ═══════════════════════════════════════
   MEMECOINS
═══════════════════════════════════════ */
async function loadMemecoins() {

  const container = document.getElementById('memeGrid');

  if (!container) return;

  container.innerHTML = `
    <div class="loading-box">
      ${t('loading')}
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

  container.innerHTML = data.map((p, i) => {

    const price = parseFloat(p.priceUsd || 0);
    const change = p.priceChange?.h24 || 0;

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

  // LOGO
  const logo = document.getElementById('m-logo');

  logo.style.display = 'block';
  logo.src = pair.info?.imageUrl || '';

  // INFO
  document.getElementById('m-name').textContent =
    pair.baseToken?.name || 'Unknown';

  document.getElementById('m-sym').textContent =
    pair.baseToken?.symbol || '???';

  // PREÇO
  const price = parseFloat(pair.priceUsd || 0);

  document.getElementById('m-price').textContent =
    '$' + (
      price < 0.01
        ? price.toFixed(8)
        : price.toFixed(6)
    );

  // CHANGE
  const change = pair.priceChange?.h24 || 0;

  const chgEl = document.getElementById('m-chg');

  chgEl.textContent =
    `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  chgEl.className =
    `meme-chg ${change >= 0 ? 'pos' : 'neg'}`;

  // STATS
  document.getElementById('m-vol').textContent =
    fmt(pair.volume?.h24 || 0);

  document.getElementById('m-liq').textContent =
    fmt(pair.liquidity?.usd || 0);

  document.getElementById('m-mc').textContent =
    fmt(pair.marketCap || pair.fdv || 0);

  // CONTRATO
  document.getElementById('m-addr').textContent =
    pair.baseToken?.address || '—';

  // LINKS
  const links = document.getElementById('m-links');

  const socials = pair.info?.socials || [];
  const websites = pair.info?.websites || [];

  let html = '';

  websites.forEach(w => {

    html += `
      <a href="${w.url}"
         target="_blank"
         class="token-link">
         🌐 Website
      </a>
    `;
  });

  socials.forEach(s => {

    let icon = '🔗';

    if (s.type === 'twitter') icon = '𝕏';
    if (s.type === 'telegram') icon = '✈️';
    if (s.type === 'discord') icon = '💬';

    html += `
      <a href="${s.url}"
         target="_blank"
         class="token-link">
         ${icon} ${s.type}
      </a>
    `;
  });

  if (!html) {

    html = `
      <div style="opacity:.7;padding:8px 0;">
        Nenhum link encontrado
      </div>
    `;
  }

  links.innerHTML = html;

  loadChart();
}

function closeModal() {

  document.getElementById('tokenModal')
    ?.classList.remove('active');
}

/* ═══════════════════════════════════════
   CHART
═══════════════════════════════════════ */
function loadChart() {

  const chart = document.getElementById('m-chart');

  if (!chart || !state.currentPair) return;

  chart.innerHTML = `
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml"
           style="width:100%;height:100%;overflow:hidden;border-radius:16px;">

        <iframe
          src="https://dexscreener.com/${state.currentPair.chainId}/${state.currentPair.pairAddress}?embed=1&theme=dark"
          style="width:100%;height:100%;border:none;"
          allowfullscreen>
        </iframe>

      </div>
    </foreignObject>
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

    addBotMsg('Olá! Sou o CryptoBot 🤖');
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

function sendChat(preset) {

  const input = document.getElementById('chatInput');

  const msg = preset || input.value.trim();

  if (!msg) return;

  addUserMsg(msg);

  input.value = '';

  setTimeout(() => {

    addBotMsg(
      (i18n[state.lang] || i18n.pt).def
    );

  }, 500);
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
