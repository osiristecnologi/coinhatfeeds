/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
const API = window.location.hostname === 'localhost'? 'http://localhost:3001/api' : 'https://coinhatfeeds.onrender.com/api';

// COLOCA TEU ENDEREÇO DA PHANTOM AQUI PRA RECEBER A TAXA
const FEE_WALLET = '9GXNpv77WRacQfPaEdBog91uYFnJwdzJfiwuDWiAxgCs';

let state = {
  lang: 'pt',
  memeData: [],
  currentPair: null,
  currentTf: 'm5',
  activeTab: 'news',
  cache: {},
  fetched: {},
  drawerOpen: false,
  chartInstance: null
};

/* ═══════════════════════════════════════
   I18N - COMPLETO
═══════════════════════════════════════ */
const i18n = {
  pt: {search:'Buscar token...',news:'Notícias',presales:'Pré-vendas',alpha:'Alpha',airdrops:'Airdrops',sponsors:'Parceiros',swap:'Swap',refresh:'Atualizar',memecoins_title:'Memecoins em Destaque',memecoins_sub:'Cotações e gráficos em tempo real',vol:'Vol 24h',liq:'Liquidez',mc:'Mkt Cap',contract:'Contrato',chart_btn:'Ver gráfico avançado',loading:'Carregando...',no_data:'Nenhum dado encontrado',live:'LIVE',no_links:'Nenhum link encontrado',bot_hello:'Olá! Sou o CryptoBot 🤖',bot_default:'Não entendi sua pergunta.',buy:'Comprar'},
  en: {search:'Search token...',news:'News',presales:'Presales',alpha:'Alpha',airdrops:'Airdrops',sponsors:'Sponsors',swap:'Swap',refresh:'Refresh',memecoins_title:'Trending Memecoins',memecoins_sub:'Live prices and charts',vol:'24h Vol',liq:'Liquidity',mc:'Market Cap',contract:'Contract',chart_btn:'Open advanced chart',loading:'Loading...',no_data:'No data found',live:'LIVE',no_links:'No links found',bot_hello:'Hello! I am CryptoBot 🤖',bot_default:'I did not understand.',buy:'Buy'},
  es: {search:'Buscar token...',news:'Noticias',presales:'Pre-ventas',alpha:'Alpha',airdrops:'Airdrops',sponsors:'Socios',swap:'Swap',refresh:'Actualizar',memecoins_title:'Memecoins Destacadas',memecoins_sub:'Precios y gráficos en tiempo real',vol:'Vol 24h',liq:'Liquidez',mc:'Cap. Mercado',contract:'Contrato',chart_btn:'Ver gráfico avanzado',loading:'Cargando...',no_data:'Sin datos',live:'VIVO',no_links:'Sin enlaces',bot_hello:'¡Hola! Soy CryptoBot 🤖',bot_default:'No entendí.',buy:'Comprar'},
  zh: {search:'搜索代币...',news:'新闻',presales:'预售',alpha:'Alpha',airdrops:'空投',sponsors:'合作伙伴',swap:'交换',refresh:'刷新',memecoins_title:'热门模因币',memecoins_sub:'实时价格和图表',vol:'24h交易量',liq:'流动性',mc:'市值',contract:'合约',chart_btn:'查看高级图表',loading:'加载中...',no_data:'未找到数据',live:'直播',no_links:'未找到链接',bot_hello:'你好！我是CryptoBot 🤖',bot_default:'我不明白。',buy:'购买'},
  ja: {search:'トークンを検索...',news:'ニュース',presales:'プレセール',alpha:'アルファ',airdrops:'エアドロップ',sponsors:'パートナー',swap:'スワップ',refresh:'更新',memecoins_title:'トレンドミームコイン',memecoins_sub:'リアルタイム価格とチャート',vol:'24時間出来高',liq:'流動性',mc:'時価総額',contract:'コントラクト',chart_btn:'詳細チャートを見る',loading:'読み込み中...',no_data:'データが見つかりません',live:'ライブ',no_links:'リンクが見つかりません',bot_hello:'こんにちは！CryptoBotです 🤖',bot_default:'理解できませんでした。',buy:'購入'},
  ru: {search:'Поиск токена...',news:'Новости',presales:'Пресейлы',alpha:'Альфа',airdrops:'Аирдропы',sponsors:'Партнеры',swap:'Обмен',refresh:'Обновить',memecoins_title:'Популярные мемкоины',memecoins_sub:'Цены и графики в реальном времени',vol:'Объем 24ч',liq:'Ликвидность',mc:'Капитализация',contract:'Контракт',chart_btn:'Открыть график',loading:'Загрузка...',no_data:'Данные не найдены',live:'В ЭФИРЕ',no_links:'Ссылки не найдены',bot_hello:'Привет! Я CryptoBot 🤖',bot_default:'Я не понял.',buy:'Купить'}
};

function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

/* ═══════════════════════════════════════
   LANGUAGE
═══════════════════════════════════════ */
function updateInterfaceLang() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('search');

  const map = {
    'dt-news': 'news',
    'dt-presales': 'presales',
    'dt-alpha': 'alpha',
    'dt-airdrops': 'airdrops',
    'dt-sponsors': 'sponsors',
    'dt-swap': 'swap',
    'nt-refresh': 'refresh',
    'nt-vol': 'vol',
    'nt-liq': 'liq',
    'nt-mc': 'mc',
    'nt-contract': 'contract',
    'nt-title': 'memecoins_title',
    'nt-sub': 'memecoins_sub',
    'liveText': 'live'
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  if (state.memeData.length > 0) renderMemes(state.memeData);
}

function setLang(lang, el) {
  state.lang = lang;
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('selected'));
  if (el) el.classList.add('selected');
  updateInterfaceLang();
  closeLang();
}

function toggleLang() {
  document.getElementById('langMenu')?.classList.toggle('active');
}

function closeLang() {
  document.getElementById('langMenu')?.classList.remove('active');
}

/* ═══════════════════════════════════════
   DRAWER
═══════════════════════════════════════ */
function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('active');
  state.drawerOpen = true;
  if (state.activeTab) loadDrawerContent(state.activeTab);
}

function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('active');
  state.drawerOpen = false;
}

function closeAll() {
  closeDrawer();
  closeModal();
  closeLang();
  closeResults();
}

function switchDrawerTab(tab, el) {
  state.activeTab = tab;
  document.querySelectorAll('.dtab').forEach(d => d.classList.remove('active'));
  if (el) el.classList.add('active');
  loadDrawerContent(tab);
}

async function loadDrawerContent(tab) {
  const body = document.getElementById('drawerBody');
  if (!body) return;

  body.innerHTML = `<div class="loading-box">${t('loading')}</div>`;

  try {
    const res = await fetch(`${API}/${tab}`);
    const json = await res.json();
    const data = json.data || [];

    if (data.length === 0) {
      body.innerHTML = `<div class="error-box">${t('no_data')}</div>`;
      return;
    }

    body.innerHTML = data.map(item => `
      <div class="drawer-item">
        <div class="drawer-item-title">${item.title || item.name || 'Sem título'}</div>
        <div class="drawer-item-desc">${item.description || item.desc || ''}</div>
        ${item.url? `<a href="${item.url}" target="_blank" class="drawer-item-link">Acessar</a>` : ''}
      </div>
    `).join('');

  } catch (err) {
    body.innerHTML = `<div class="error-box">Erro ao carregar ${tab}</div>`;
  }
}

/* ═══════════════════════════════════════
   MEMECOINS - USANDO SEU BACKEND /api/memes
═══════════════════════════════════════ */
async function loadMemecoins() {
  const container = document.getElementById('memeGrid');
  if (!container) return;

  container.innerHTML = `<div class="loading-box">${t('loading')}</div>`;

  try {
    const res = await fetch(`${API}/memes`);
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      throw new Error(json.error || 'Sem dados');
    }

    state.memeData = json.data;
    renderMemes(json.data);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error-box">Erro: ${err.message}</div>`;
  }
}

function renderMemes(data) {
  const container = document.getElementById('memeGrid');
  if (!container) return;

  container.innerHTML = data.map((p, i) => {
    const price = parseFloat(p.priceUsd || 0);
    const change = p.priceChange?.h24 || 0;
    const pairData = encodeURIComponent(JSON.stringify(p));

    return `
      <div class="meme-card" onclick='openTokenFromData("${pairData}")'>
        <div class="meme-top">
          <img class="meme-logo" src="${p.info?.imageUrl || ''}" onerror="this.style.display='none'">
          <div>
            <div class="meme-name">${p.baseToken?.name || 'Unknown'}</div>
            <div class="meme-sym">${p.baseToken?.symbol || '???'}</div>
          </div>
          ${i < 3? '<span class="meme-badge badge-hot">HOT</span>' : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <span class="meme-price">$${price < 0.01? price.toFixed(8) : price.toFixed(4)}</span>
            <span class="meme-chg ${change >= 0? 'pos' : 'neg'}">${change >= 0? '+' : ''}${change.toFixed(2)}%</span>
          </div>
          <button onclick="event.stopPropagation(); abrirSwapToken('${p.baseToken?.address}')" style="background:var(--blue);color:white;border:none;border-radius:8px;padding:6px 12px;font-family:'DM Sans',sans-serif;font-size:0.75rem;font-weight:600;cursor:pointer;position:relative;z-index:2;">${t('buy')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function openTokenFromData(encodedData) {
  const pair = JSON.parse(decodeURIComponent(encodedData));
  openToken(pair);
}

/* ═══════════════════════════════════════
   TOKEN MODAL
═══════════════════════════════════════ */
function openToken(pair) {
  state.currentPair = pair;
  document.getElementById('tokenModal')?.classList.add('active');

  const logo = document.getElementById('m-logo');
  logo.style.display = 'block';
  logo.src = pair.info?.imageUrl || '';

  document.getElementById('m-name').textContent = pair.baseToken?.name || 'Unknown';
  document.getElementById('m-sym').textContent = pair.baseToken?.symbol || '???';

  const price = parseFloat(pair.priceUsd || 0);
  document.getElementById('m-price').textContent = '$' + (price < 0.01? price.toFixed(8) : price.toFixed(6));

  const change = pair.priceChange?.h24 || 0;
  const chgEl = document.getElementById('m-chg');
  chgEl.textContent = `${change >= 0? '+' : ''}${change.toFixed(2)}%`;
  chgEl.className = `meme-chg ${change >= 0? 'pos' : 'neg'}`;

  document.getElementById('m-vol').textContent = fmt(pair.volume?.h24 || 0);
  document.getElementById('m-liq').textContent = fmt(pair.liquidity?.usd || 0);
  document.getElementById('m-mc').textContent = fmt(pair.marketCap || pair.fdv || 0);
  document.getElementById('m-addr').textContent = pair.baseToken?.address || '—';

  renderTokenLinks(pair);
  setTimeout(() => { loadChart(); }, 100);
}

function renderTokenLinks(pair) {
  const links = document.getElementById('m-links');
  if (!links) return;

  const socials = pair.info?.socials || [];
  const websites = pair.info?.websites || [];
  let html = '';

  html += `<button onclick="abrirSwapToken('${pair.baseToken?.address}')" style="background:var(--blue);color:white;border:none;border-radius:8px;padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;width:100%;margin-bottom:12px;">🔄 ${t('buy')} ${pair.baseToken?.symbol || ''}</button>`;

  websites.forEach(w => {
    html += `<a href="${w.url}" target="_blank" class="token-link">🌐 Website</a>`;
  });

  socials.forEach(s => {
    let icon = '🔗';
    if (s.type === 'twitter') icon = '𝕏';
    if (s.type === 'telegram') icon = '✈️';
    if (s.type === 'discord') icon = '💬';
    html += `<a href="${s.url}" target="_blank" class="token-link">${icon} ${s.type}</a>`;
  });

  if (websites.length === 0 && socials.length === 0) {
    html += `<div style="opacity:.7;padding:8px 0;">${t('no_links')}</div>`;
  }

  links.innerHTML = html;
}

function closeModal() {
  document.getElementById('tokenModal')?.classList.remove('active');
  if (state.chartInstance) {
    state.chartInstance.remove();
    state.chartInstance = null;
  }
}

/* ═══════════════════════════════════════
   CHART - LIGHTWEIGHT CHARTS
═══════════════════════════════════════ */
function loadChart() {
  const chartContainer = document.getElementById('m-chart');
  if (!chartContainer ||!state.currentPair) return;

  if (state.chartInstance) state.chartInstance.remove();
  chartContainer.innerHTML = '';

  const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 320,
    layout: { background: { color: '#0f172a' }, textColor: '#94a3b8' },
    grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
    crosshair: { mode: 1 },
    rightPriceScale: { borderColor: '#334155' },
    timeScale: { borderColor: '#334155' }
  });

  state.chartInstance = chart;

  const areaSeries = chart.addAreaSeries({
    lineColor: '#2563eb',
    topColor: 'rgba(37,99,235,0.45)',
    bottomColor: 'rgba(37,99,235,0.02)',
    lineWidth: 3
  });

  const currentPrice = parseFloat(state.currentPair.priceUsd || 0);
  const data = [];
  let base = currentPrice || 0.0001;

  for (let i = 0; i < 40; i++) {
    base = base + (Math.random() - 0.5) * (base * 0.08);
    data.push({
      time: Math.floor(Date.now() / 1000) - (40 - i) * 60,
      value: Number(base.toFixed(8))
    });
  }

  areaSeries.setData(data);
  document.getElementById('chartLoading').style.display = 'none';
}

function switchTab(el, tf) {
  state.currentTf = tf;
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
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
      const res = await fetch(`${API}/search?q=${q}`);
      const data = await res.json();
      renderSearch(data.pairs || []);
    } catch (err) {
      console.error(err);
    }
  }, 400);
}

function renderSearch(pairs) {
  const container = document.getElementById('search-results');
  if (!container) return;

  container.innerHTML = pairs.slice(0, 8).map(p => {
    const pairData = encodeURIComponent(JSON.stringify(p));
    return `
      <div class="sr-item" onclick='openTokenFromData("${pairData}");closeResults()'>
        <div class="sr-name">${p.baseToken?.name || 'Unknown'}</div>
        <div class="sr-price">$${parseFloat(p.priceUsd || 0).toFixed(6)}</div>
      </div>
    `;
  }).join('');

  container.classList.add('active');
}

function showResults() {
  const results = document.getElementById('search-results');
  if (results && results.innerHTML.trim()) {
    results.classList.add('active');
  }
}

function closeResults() {
  document.getElementById('search-results')?.classList.remove('active');
}

/* ═══════════════════════════════════════
   CHATBOT - ARRUMADO
═══════════════════════════════════════ */
function toggleChat() {
  const win = document.getElementById('chatWindow');
  if (!win) return;

  win.classList.toggle('open');

  if (win.classList.contains('open') && document.getElementById('chatMessages').children.length === 0) {
    addBotMsg(t('bot_hello'));
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
    const lower = msg.toLowerCase();
    let reply = t('bot_default');

    if (lower.includes('bitcoin') || lower.includes('btc')) {
      reply = state.lang === 'pt'? 'Bitcoin tá dominando. Quer ver o preço? Busca "BTC" ali em cima.' : 'Bitcoin is dominating. Want to check price? Search "BTC" above.';
    } else if (lower.includes('solana') || lower.includes('sol')) {
      reply = state.lang === 'pt'? 'Solana é onde as memecoins nascem. Clica numa moeda pra ver o gráfico.' : 'Solana is where memecoins are born. Click a token to see the chart.';
    } else if (lower.includes('comprar') || lower.includes('buy') || lower.includes('swap')) {
      reply = state.lang === 'pt'? 'Clica no botão "Comprar" do token que quiser. Abre direto no Jupiter com 0.5% de taxa pra nós.' : 'Click the "Buy" button on any token. Opens Jupiter directly with 0.5% fee for us.';
    } else if (lower.includes('oi') || lower.includes('ola') || lower.includes('hello') || lower.includes('hey')) {
      reply = t('bot_hello');
    } else if (lower.includes('taxa') || lower.includes('fee')) {
      reply = state.lang === 'pt'? 'Taxa de 0.5% em cada swap via Jupiter. Vai direto pra carteira do projeto.' : '0.5% fee on each Jupiter swap. Goes to project wallet.';
    }

    addBotMsg(reply);
  }, 500);
}

/* ═══════════════════════════════════════
   JUPITER SWAP
═══════════════════════════════════════ */
function abrirSwapGeral() {
  if (!window.Jupiter) {
    alert('Jupiter ainda carregando. Tenta em 2 segundos.');
    return;
  }

  window.Jupiter.init({
    displayMode: "modal",
    endpoint: "https://api.mainnet-beta.solana.com",
    formProps: { initialInputMint: "So11111111111111112" },
    platformFeeAndAccounts: {
      feeBps: 50,
      feeAccounts: new Map([[FEE_WALLET, "So11111111111111111111112"]])
    }
  });
}

function abrirSwapToken(mintToken) {
  if (!window.Jupiter) {
    alert('Jupiter ainda carregando. Tenta em 2 segundos.');
    return;
  }

  if (!mintToken || mintToken === 'undefined') {
    alert('Token sem endereço válido');
    return;
  }

  window.Jupiter.init({
    displayMode: "modal",
    endpoint: "https://api.mainnet-beta.solana.com",
    formProps: {
      initialInputMint: "So11111111111111111112",
      initialOutputMint: mintToken,
    },
    platformFeeAndAccounts: {
      feeBps: 50,
      feeAccounts: new Map([[FEE_WALLET, "So11111111111111111112"]])
    }
  });
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
const fmt = n =>
!n? '—'
  : n >= 1e9? '$' + (n / 1e9).toFixed(2) + 'B'
  : n >= 1e6? '$' + (n / 1e6).toFixed(2) + 'M'
  : n >= 1e3? '$' + (n / 1e3).toFixed(2) + 'K'
  : '$' + Number(n).toFixed(2);

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  updateInterfaceLang();
  loadMemecoins();
  setInterval(loadMemecoins, 30000);

  document.addEventListener('click', e => {
    if (!e.target.closest('.lang-dropdown')) closeLang();
    if (!e.target.closest('.search-wrap')) closeResults();
  });
});
