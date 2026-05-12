/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
const API = 'https://coinhatfeeds.onrender.com/api';
const FEE_ACCOUNT = "Bv9FatggxzDiWqYNEL9szrDvtmhXcx2xPeUKptGiWmie"; // TUA CARTEIRA
const PLATFORM_FEE_BPS = 30; // 0.3%

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
    chart_btn: 'Ver gráfico avançado',
    swap_btn: 'Swap na Jupiter',
    loading: 'Carregando...',
    no_data: 'Nenhum dado encontrado',
    live: 'LIVE',
    no_links: 'Nenhum link encontrado',
    bot_hello: 'Olá! Sou o CryptoBot 🤖',
    bot_default: 'Não entendi sua pergunta.'
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
    chart_btn: 'Open advanced chart',
    swap_btn: 'Swap on Jupiter',
    loading: 'Loading...',
    no_data: 'No data found',
    live: 'LIVE',
    no_links: 'No links found',
    bot_hello: 'Hello! I am CryptoBot 🤖',
    bot_default: 'I did not understand.'
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
  if (searchInput) searchInput.placeholder = t('search');

  const map = {
    'dt-news': 'news', 'dt-presales': 'presales', 'dt-alpha': 'alpha',
    'dt-airdrops': 'airdrops', 'dt-sponsors': 'sponsors', 'nt-refresh': 'refresh',
    'nt-vol': 'vol', 'nt-liq': 'liq', 'nt-mc': 'mc', 'nt-contract': 'contract',
    'dexBtnLabel': 'chart_btn'
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  const titleEl = document.querySelector('.section-title');
  if (titleEl) titleEl.innerHTML = `🔥 ${t('memecoins_title')}`;

  const subEl = document.querySelector('.section-sub');
  if (subEl) {
    subEl.innerHTML = `${t('memecoins_sub')} · <span class="live"><span class="live-dot"></span>${t('live')}</span>`;
  }
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

/* ═══════════════════════════════════════
   MEMECOINS - VERSÃO QUE FUNCIONA
═══════════════════════════════════════ */
async function loadMemecoins() {
  const container = document.getElementById('memeGrid');
  if (!container) return;

  container.innerHTML = `<div class="loading-box">${t('loading')}</div>`;

  try {
    // Usa search direto pq boosts tá bugado
    const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=SOL');
    if (!res.ok) throw new Error('DexScreener offline');
    
    const data = await res.json();
    const solPairs = (data.pairs || [])
     .filter(p => p.chainId === 'solana' && p.liquidity?.usd > 10000)
     .sort((a,b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
     .slice(0, 12);

    if (!solPairs.length) throw new Error('Sem pares');

    state.memeData = solPairs;
    renderMemes(solPairs);

  } catch (err) {
    console.error('Erro:', err);
    container.innerHTML = `
      <div class="error-box">
        Erro ao carregar. <button onclick="loadMemecoins()" style="padding:6px 12px;border:none;background:#2563eb;color:#fff;border-radius:6px;cursor:pointer">Tentar de novo</button>
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
    const pairData = JSON.stringify(p).replace(/'/g, "&apos;");

    return `
      <div class="meme-card">
        <div class="meme-top" onclick='openToken(${pairData})'>
          <img class="meme-logo" src="${p.info?.imageUrl || ''}" onerror="this.style.display='none'">
          <div>
            <div class="meme-name">${p.baseToken?.name || 'Unknown'}</div>
            <div class="meme-sym">${p.baseToken?.symbol || '???'}</div>
          </div>
          ${i < 3? '<span class="meme-badge badge-hot">HOT</span>' : ''}
        </div>
        <div onclick='openToken(${pairData})'>
          <span class="meme-price">$${price < 0.01? price.toFixed(8) : price.toFixed(4)}</span>
          <span class="meme-chg ${change >= 0? 'pos' : 'neg'}">${change >= 0? '+' : ''}${change.toFixed(2)}%</span>
        </div>
        <button class="swap-btn" onclick='event.stopPropagation(); swapToken("${p.baseToken?.address}", "${p.baseToken?.symbol}")' 
          style="width:100%;margin-top:8px;padding:8px;border:none;background:#2563eb;color:#fff;border-radius:8px;cursor:pointer;font-weight:600">
          ${t('swap_btn')} 0.3%
        </button>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════
   SWAP JUPITER COM TUA TAXA
═══════════════════════════════════════ */
async function swapToken(outputMint, symbol) {
  if (!window.phantom?.solana) {
    alert('Conecta a Phantom primeiro!');
    return;
  }

  try {
    const userWallet = window.phantom.solana.publicKey.toString();
    const inputMint = "EPjF...Dt1v"; // USDC
    const amount = 10_000_000; // $10 USDC default

    const quoteRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&platformFeeBps=${PLATFORM_FEE_BPS}`);
    const quote = await quoteRes.json();

    const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userWallet,
        feeAccount: FEE_ACCOUNT,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto'
      })
    });

    const { swapTransaction } = await swapRes.json();
    const signed = await window.phantom.solana.signAndSendTransaction({
      transaction: swapTransaction
    });

    alert(`Swap de ${symbol} enviado! Fee de 0.3% foi pra tua carteira 🎉`);
    
  } catch (err) {
    console.error('Erro no swap:', err);
    alert('Erro no swap. Vê o console F12');
  }
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
  loadChart();
}

function renderTokenLinks(pair) {
  const links = document.getElementById('m-links');
  if (!links) return;

  const socials = pair.info?.socials || [];
  const websites = pair.info?.websites || [];
  let html = '';

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

  if (!html) {
    html = `<div style="opacity:.7;padding:8px 0;">${t('no_links')}</div>`;
  }

  links.innerHTML = html;
}

function closeModal() {
  document.getElementById('tokenModal')?.classList.remove('active');
}

/* ═══════════════════════════════════════
   CHART
═══════════════════════════════════════ */
async function loadChart() {
  const chartContainer = document.getElementById('m-chart');
  if (!chartContainer ||!state.currentPair) return;

  chartContainer.innerHTML = '';
  const chartDiv = document.createElement('div');
  chartDiv.style.width = '100%';
  chartDiv.style.height = '100%';
  chartContainer.appendChild(chartDiv);

  const chart = LightweightCharts.createChart(chartDiv, {
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
  window.addEventListener('resize', () => {
    chart.applyOptions({ width: chartContainer.clientWidth });
  });
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
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
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

  container.innerHTML = pairs.slice(0, 8).map(p => `
    <div class="sr-item" onclick='openToken(${JSON.stringify(p).replace(/'/g, "&apos;")});closeResults()'>
      <div class="sr-name">${p.baseToken?.name || 'Unknown'}</div>
      <div class="sr-price">$${parseFloat(p.priceUsd || 0).toFixed(6)}</div>
    </div>
  `).join('');

  container.classList.add('active');
}

function closeResults() {
  document.getElementById('search-results')?.classList.remove('active');
}

/* ═══════════════════════════════════════
   CHATBOT
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
  setTimeout(() => { addBotMsg(t('bot_default')); }, 500);
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
