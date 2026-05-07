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
   I18N - FUSÃO: ADICIONADO
═══════════════════════════════════════ */
const i18n = {
  pt: {
    'search': 'Buscar token...',
    'news': 'Notícias',
    'presales': 'Pré-vendas',
    'alpha': 'Alpha',
    'airdrops': 'Airdrops',
    'sponsors': 'Parceiros',
    'refresh': 'Atualizar',
    'memecoins_title': 'Memecoins em Destaque',
    'memecoins_sub': 'Cotações e gráficos em tempo real',
    'vol': 'Vol 24h',
    'liq': 'Liquidez',
    'mc': 'Mkt Cap',
    'contract': 'Contrato',
    'chart_btn': 'Ver Gráfico Avançado',
    'loading': 'Carregando...',
    'no_data': 'Nenhum dado encontrado',
    'live': 'LIVE',
    kb: [
      {k: ['preço','price','cotação'], r: 'Consulte o preço em tempo real no card da memecoin. Clique para ver gráfico.'},
      {k: ['airdrop','grátis'], r: 'Confira a aba Airdrops no menu ☰ para campanhas ativas.'},
      {k: ['alpha','call'], r: 'Aba Alpha traz calls exclusivas da comunidade.'},
      {k: ['presale','pré-venda'], r: 'Pré-vendas listadas na aba Pré-vendas com links oficiais.'}
    ],
    def: 'Não entendi. Pergunte sobre preço, airdrop, alpha ou pré-venda.'
  },
  en: {
    'search': 'Search token...',
    'news': 'News',
    'presales': 'Presales',
    'alpha': 'Alpha',
    'airdrops': 'Airdrops',
    'sponsors': 'Partners',
    'refresh': 'Refresh',
    'memecoins_title': 'Trending Memecoins',
    'memecoins_sub': 'Real-time quotes and charts',
    'vol': 'Vol 24h',
    'liq': 'Liquidity',
    'mc': 'Mkt Cap',
    'contract': 'Contract',
    'chart_btn': 'Advanced Chart',
    'loading': 'Loading...',
    'no_data': 'No data found',
    'live': 'LIVE',
    kb: [],
    def: 'I did not understand. Ask about price, airdrop, alpha or presale.'
  },
  es: {
    'search': 'Buscar token...',
    'news': 'Noticias',
    'presales': 'Pre-ventas',
    'alpha': 'Alpha',
    'airdrops': 'Airdrops',
    'sponsors': 'Socios',
    'refresh': 'Actualizar',
    'memecoins_title': 'Memecoins Destacadas',
    'memecoins_sub': 'Cotizaciones y gráficos en tiempo real',
    'vol': 'Vol 24h',
    'liq': 'Liquidez',
    'mc': 'Cap Mercado',
    'contract': 'Contrato',
    'chart_btn': 'Gráfico Avanzado',
    'loading': 'Cargando...',
    'no_data': 'Sin datos',
    'live': 'VIVO',
    kb: [],
    def: 'No entendí. Pregunta sobre precio, airdrop, alpha o preventa.'
  },
  zh: {
    'search': '搜索代币...',
    'news': '新闻',
    'presales': '预售',
    'alpha': 'Alpha',
    'airdrops': '空投',
    'sponsors': '合作伙伴',
    'refresh': '刷新',
    'memecoins_title': '热门Memecoin',
    'memecoins_sub': '实时报价和图表',
    'vol': '24h量',
    'liq': '流动性',
    'mc': '市值',
    'contract': '合约',
    'chart_btn': '高级图表',
    'loading': '加载中...',
    'no_data': '未找到数据',
    'live': '直播',
    kb: [],
    def: '我不明白。询问价格、空投、alpha或预售。'
  },
  ja: {
    'search': 'トークンを検索...',
    'news': 'ニュース',
    'presales': 'プレセール',
    'alpha': 'Alpha',
    'airdrops': 'エアドロップ',
    'sponsors': 'パートナー',
    'refresh': '更新',
    'memecoins_title': '注目ミームコイン',
    'memecoins_sub': 'リアルタイム相場とチャート',
    'vol': '24h出来高',
    'liq': '流動性',
    'mc': '時価総額',
    'contract': 'コントラクト',
    'chart_btn': '詳細チャート',
    'loading': '読み込み中...',
    'no_data': 'データなし',
    'live': 'LIVE',
    kb: [],
    def: '理解できませんでした。価格、エアドロップ、アルファ、プレセールについて質問してください。'
  },
  ru: {
    'search': 'Поиск токена...',
    'news': 'Новости',
    'presales': 'Пресейлы',
    'alpha': 'Alpha',
    'airdrops': 'Аирдропы',
    'sponsors': 'Партнеры',
    'refresh': 'Обновить',
    'memecoins_title': 'Топ Мемкоины',
    'memecoins_sub': 'Котировки и графики в реальном времени',
    'vol': 'Объем 24ч',
    'liq': 'Ликвидность',
    'mc': 'Капитализация',
    'contract': 'Контракт',
    'chart_btn': 'Продвинутый график',
    'loading': 'Загрузка...',
    'no_data': 'Нет данных',
    'live': 'LIVE',
    kb: [],
    def: 'Не понял. Спросите о цене, аирдропе, альфе или пресейле.'
  }
};

function t(key) {
  return (i18n[state.lang] || i18n.pt)[key] || key;
}

// FUSÃO: Atualiza textos da interface
function updateInterfaceLang() {
  const els = {
    'searchInput': 'placeholder',
    'dt-news': 'textContent',
    'dt-presales': 'textContent',
    'dt-alpha': 'textContent',
    'dt-airdrops': 'textContent',
    'dt-sponsors': 'textContent',
    'nt-refresh': 'textContent',
    'nt-vol': 'textContent',
    'nt-liq': 'textContent',
    'nt-mc': 'textContent',
    'nt-contract': 'textContent',
    'dexBtnLabel': 'textContent'
  };

  if(document.getElementById('searchInput')) document.getElementById('searchInput').placeholder = t('search');
  if(document.getElementById('dt-news')) document.getElementById('dt-news').textContent = t('news');
  if(document.getElementById('dt-presales')) document.getElementById('dt-presales').textContent = t('presales');
  if(document.getElementById('dt-alpha')) document.getElementById('dt-alpha').textContent = t('alpha');
  if(document.getElementById('dt-airdrops')) document.getElementById('dt-airdrops').textContent = t('airdrops');
  if(document.getElementById('dt-sponsors')) document.getElementById('dt-sponsors').textContent = t('sponsors');
  if(document.getElementById('nt-refresh')) document.getElementById('nt-refresh').textContent = t('refresh');
  if(document.getElementById('nt-vol')) document.getElementById('nt-vol').textContent = t('vol');
  if(document.getElementById('nt-liq')) document.getElementById('nt-liq').textContent = t('liq');
  if(document.getElementById('nt-mc')) document.getElementById('nt-mc').textContent = t('mc');
  if(document.getElementById('nt-contract')) document.getElementById('nt-contract').textContent = t('contract');
  if(document.getElementById('dexBtnLabel')) document.getElementById('dexBtnLabel').textContent = t('chart_btn');

  // Atualiza títulos
  const titleEl = document.querySelector('.section-title');
  if(titleEl) titleEl.childNodes[1].nodeValue = ' ' + t('memecoins_title');
  const subEl = document.querySelector('.section-sub');
  if(subEl) subEl.innerHTML = `${t('memecoins_sub')} · <span class="live"><span class="live-dot"></span>${t('live')}</span>`;
}

function setLang(lang, el) {
  state.lang = lang;
  state.fetched = {}; // Limpa cache ao trocar idioma
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('selected'));
  if(el) el.classList.add('selected');
  updateInterfaceLang();
  closeLang();
  // Recarrega aba ativa com novo idioma
  loadTab(state.activeTab, true);
}

function toggleLang() {
  document.getElementById('langMenu').classList.toggle('active');
}

function closeLang() {
  document.getElementById('langMenu').classList.remove('active');
}

/* ═══════════════════════════════════════
   DRAWER - FUSÃO: ADICIONADO
═══════════════════════════════════════ */
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('active');
  state.drawerOpen = true;
  loadTab(state.activeTab); // Carrega tab ativa ao abrir
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
  state.drawerOpen = false;
}

function closeAll() {
  closeDrawer();
  closeModal();
  closeLang();
  closeResults();
}

function switchDrawerTab(tab, el) {
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  state.activeTab = tab;
  loadTab(tab);
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
   TABS LOADER - FUSÃO: COM LANG
═══════════════════════════════════════ */
async function loadTab(tab, force = false) {
  const cacheKey = `${tab}_${state.lang}`;

  if (state.fetched[cacheKey] &&!force) {
    return renderTab(tab, state.cache[cacheKey]);
  }

  showDrawerLoading();

  let data = [];
  const langParam = `?lang=${state.lang}`;

  switch (tab) {
    case 'news':
      data = await apiFetch(`news${langParam}`);
      break;
    case 'presales':
      data = await apiFetch(`presales${langParam}`);
      break;
    case 'alpha':
      data = await apiFetch(`alpha${langParam}`);
      break;
    case 'airdrops':
      data = await apiFetch(`airdrops${langParam}`);
      break;
    case 'sponsors':
      data = await apiFetch(`sponsors${langParam}`);
      break;
  }

  state.cache[cacheKey] = data || [];
  state.fetched[cacheKey] = true;

  renderTab(tab, data);
}

function showDrawerLoading() {
  const container = document.getElementById('drawerBody');
  if (container) {
    container.innerHTML = `
      <div class="news-skeleton"><div class="sk sk-img"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>
      <div class="news-skeleton"><div class="sk sk-img"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>
    `;
  }
}

/* ═══════════════════════════════════════
   RENDER CONTROLLER - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderTab(tab, data) {
  const container = document.getElementById('drawerBody');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📭</div>
        <p>${t('no_data')}</p>
      </div>
    `;
    return;
  }

  const map = {
    news: renderNews,
    presales: renderPresales,
    alpha: renderAlpha,
    airdrops: renderAirdrops,
    sponsors: renderSponsors
  };

  map[tab]?.(data, container);
}

/* ═══════════════════════════════════════
   RENDER NEWS - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderNews(data, container) {
  container.innerHTML = data.map(news => `
    <div class="news-card" onclick="window.open('${news.url || '#'}', '_blank')">
      ${news.image? `<img class="news-img" src="${news.image}" onerror="this.style.display='none'" alt="">` : ''}
      <div class="news-info">
        <div class="news-source" style="color:var(--blue)">${news.source || 'CoinHatFeeds'}</div>
        <div class="news-title">${news.title}</div>
        <div class="news-date">${new Date(news.publishedAt || Date.now()).toLocaleDateString(state.lang === 'pt'? 'pt-BR' : 'en-US')}</div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER PRESALES - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderPresales(data, container) {
  container.innerHTML = data.map(p => `
    <div class="presale-card">
      <div class="presale-header">
        <img class="presale-logo" src="${p.logo || p.image}" onerror="this.style.display='none'" alt="">
        <div>
          <div class="presale-name">${p.name}</div>
          <div class="presale-chain">${p.chain || 'BSC'}</div>
        </div>
        <span class="status-badge status-${p.status || 'active'}">${p.status || 'active'}</span>
      </div>
      <div class="presale-progress">
        <div class="presale-progress-fill" style="width:${p.progress || 0}%"></div>
      </div>
      <div class="presale-meta">
        <span>Arrecadado: <strong>${fmt(p.raised || 0)}</strong></span>
        <span>Meta: <strong>${fmt(p.target || 0)}</strong></span>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER ALPHA - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderAlpha(data, container) {
  container.innerHTML = data.map(a => `
    <div class="alpha-card">
      <div class="alpha-tag">${a.tag || 'ALPHA'}</div>
      <div class="alpha-title">${a.title}</div>
      <div class="alpha-body">${a.body || a.description}</div>
      <span class="risk-badge risk-${a.risk || 'medium'}">${a.risk || 'MEDIUM'} RISK</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER AIRDROPS - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderAirdrops(data, container) {
  container.innerHTML = data.map(a => `
    <div class="airdrop-card">
      <div class="airdrop-header">
        <img class="airdrop-logo" src="${a.logo || a.image}" onerror="this.style.display='none'" alt="">
        <div class="airdrop-name">${a.name}</div>
      </div>
      <div class="airdrop-reward">
        <span class="airdrop-reward-amount">${a.reward || '???'} ${a.token || ''}</span>
        <span class="airdrop-reward-usd">≈ ${fmt(a.usdValue || 0)}</span>
      </div>
      ${(a.tasks || []).map(task => `<div class="airdrop-task">✓ ${task}</div>`).join('')}
      <a href="${a.link || '#'}" target="_blank" class="airdrop-link">Participar →</a>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   RENDER SPONSORS - FUSÃO: TELA CHEIA
═══════════════════════════════════════ */
function renderSponsors(data, container) {
  container.innerHTML = data.map(s => `
    <div class="sponsor-card ${s.tier === 'gold'? 'gold' : ''}" onclick="window.open('${s.url || '#'}', '_blank')">
      <img class="sponsor-logo" src="${s.logo}" onerror="this.style.display='none'" alt="">
      <div class="sponsor-info">
        <div class="sponsor-name">${s.name}</div>
        <div class="sponsor-tag">${s.description || s.tag}</div>
      </div>
      <span class="sponsor-badge-tier tier-${s.tier || 'silver'}">${s.tier || 'SILVER'}</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════
   MEMECOINS - MANTIDO DO ORIGINAL
═══════════════════════════════════════ */
async function loadMemecoins() {
  const container = document.getElementById('memeGrid');
  if(!container) return;

  // Mantém fallback
  if (!state.memeData.length) {
    container.innerHTML = `
      <div class="meme-skeleton"><div style="display:flex;gap:12px;align-items:center"><div class="sk sk-circle"></div><div style="flex:1"><div class="sk sk-line" style="margin:0 0 6px;height:12px"></div><div class="sk sk-line" style="margin:0;width:50%;height:10px"></div></div><div class="sk sk-block"></div></div>
      <div class="meme-skeleton"><div style="display:flex;gap:12px;align-items:center"><div class="sk sk-circle"></div><div style="flex:1"><div class="sk sk-line" style="margin:0 0 6px;height:12px"></div><div class="sk sk-line" style="margin:0;width:50%;height:10px"></div></div><div class="sk sk-block"></div></div>
    `;
  }

  try {
    const res = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
    const boosts = await res.json();
    const pairs = boosts.slice(0, 18);

    if (pairs.length) {
      state.memeData = pairs;
      renderMemes(pairs);
    }
  } catch(e) {
    console.error('Erro DexScreener:', e);
  }
}

function renderMemes(data) {
  const container = document.getElementById('memeGrid');
  if (!container) return;

  container.innerHTML = data.map((p, i) => {
    const price = p.priceUsd? parseFloat(p.priceUsd) : 0;
    const change = p.priceChange?.h24 || 0;
    const vol = p.volume?.h24 || 0;
    const liq = p.liquidity?.usd || 0;
    const name = p.baseToken?.name || 'Unknown';
    const sym = p.baseToken?.symbol || '???';

    return `
      <div class="meme-card" onclick='openToken(${JSON.stringify(p).replace(/'/g,"&apos;")})'>
        <div class="meme-top">
          <img class="meme-logo" src="${p.info?.imageUrl || p.url}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23e8f0ff%22/%3E%3C/svg%3E'" alt="">
          <div>
            <div class="meme-name">${name}</div>
            <div class="meme-sym">${sym}</div>
          </div>
          ${i < 3? '<span class="meme-badge badge-hot">HOT</span>' : ''}
        </div>
        <div>
          <span class="meme-price">$${price < 0.01? price.toFixed(8) : price.toFixed(4)}</span>
          <span class="meme-chg ${change >= 0? 'pos' : 'neg'}">${change >= 0? '+' : ''}${change.toFixed(2)}%</span>
        </div>
        <div class="meme-stats">
          <div class="meme-stat">Vol 24h<span>${fmt(vol)}</span></div>
          <div class="meme-stat">Liq<span>${fmt(liq)}</span></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════
   MODAL TOKEN - MANTIDO DO ORIGINAL
═══════════════════════════════════════ */
function openToken(pair) {
  state.currentPair = pair;
  document.getElementById('tokenModal').classList.add('active');
  document.getElementById('m-logo').src = pair.info?.imageUrl || pair.url || '';
  document.getElementById('m-name').textContent = pair.baseToken?.name || 'Unknown';
  document.getElementById('m-sym').textContent = pair.baseToken?.symbol || '???';
  document.getElementById('m-price').textContent = '$' + (parseFloat(pair.priceUsd) || 0).toFixed(6);

  const change = pair.priceChange?.h24 || 0;
  const chgEl = document.getElementById('m-chg');
  chgEl.textContent = `${change >= 0? '+' : ''}${change.toFixed(2)}%`;
  chgEl.className = `meme-chg ${change >= 0? 'pos' : 'neg'}`;

  document.getElementById('m-vol').textContent = fmt(pair.volume?.h24 || 0);
  document.getElementById('m-liq').textContent = fmt(pair.liquidity?.usd || 0);
  document.getElementById('m-mc').textContent = fmt(pair.fdv || pair.marketCap || 0);
  document.getElementById('m-addr').textContent = pair.baseToken?.address || '—';

  // Links
  const linksEl = document.getElementById('m-links');
  const links = [];
  if(pair.info?.websites?.[0]?.url) links.push(`<a href="${pair.info.websites[0].url}" target="_blank" class="modal-link web">🌐 Website</a>`);
  if(pair.info?.socials?.find(s => s.type === 'twitter')?.url) links.push(`<a href="${pair.info.socials.find(s => s.type === 'twitter').url}" target="_blank" class="modal-link tw">𝕏 Twitter</a>`);
  if(pair.info?.socials?.find(s => s.type === 'telegram')?.url) links.push(`<a href="${pair.info.socials.find(s => s.type === 'telegram').url}" target="_blank" class="modal-link tg">✈️ Telegram</a>`);
  linksEl.innerHTML = links.join('');

  // Chart
  loadChart('m5');
}

function closeModal() {
  document.getElementById('tokenModal').classList.remove('active');
}

function switchTab(el, tf) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  state.currentTf = tf;
  loadChart(tf);
}

function loadChart(tf) {
  // Simples: usa DexScreener embed
  const chart = document.getElementById('m-chart');
  if(!state.currentPair) return;

  const chainId = state.currentPair.chainId;
  const pairAddress = state.currentPair.pairAddress;

  chart.innerHTML = `<iframe src="https://dexscreener.com/${chainId}/${pairAddress}?embed=1&theme=light&trades=0&info=0" style="width:100%;height:100%;border:none;"></iframe>`;
}

function openChartScreen() {
  if(!state.currentPair) return;
  const chainId = state.currentPair.chainId;
  const pairAddress = state.currentPair.pairAddress;
  document.getElementById('chartScreenFrame').src = `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&theme=light`;
  document.getElementById('chartScreenTitle').textContent = state.currentPair.baseToken?.symbol || 'Chart';
  document.getElementById('chartScreen').style.display = 'flex';
}

function closeChartScreen() {
  document.getElementById('chartScreen').style.display = 'none';
  document.getElementById('chartScreenFrame').src = '';
}

/* ═══════════════════════════════════════
   SEARCH - MANTIDO
═══════════════════════════════════════ */
let searchTimeout;

function onSearch(q) {
  clearTimeout(searchTimeout);
  if (q.length < 2) {
    closeResults();
    return;
  }

  searchTimeout = setTimeout(async () => {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
    const data = await res.json();
    renderSearch(data.pairs || []);
  }, 400);
}

function showResults() {
  const results = document.getElementById('search-results');
  if(results.children.length > 0) results.classList.add('active');
}

function closeResults() {
  document.getElementById('search-results').classList.remove('active');
}

function renderSearch(pairs) {
  const container = document.getElementById('search-results');
  if(!container) return;

  if(!pairs.length) {
    container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--muted)">Nenhum resultado</div>';
    container.classList.add('active');
    return;
  }

  container.innerHTML = pairs.slice(0, 8).map(p => `
    <div class="sr-item" onclick='openToken(${JSON.stringify(p).replace(/'/g,"&apos;")});closeResults()'>
      <img class="sr-logo" src="${p.info?.imageUrl || ''}" onerror="this.style.display='none'">
      <div>
        <div class="sr-name">${p.baseToken?.name || 'Unknown'}</div>
        <div class="sr-pair">${p.baseToken?.symbol}/${p.quoteToken?.symbol}</div>
      </div>
      <div style="text-align:right">
        <div class="sr-price">$${(parseFloat(p.priceUsd) || 0).toFixed(6)}</div>
        <div class="sr-chg ${(p.priceChange?.h24 || 0) >= 0? 'pos' : 'neg'}">${(p.priceChange?.h24 || 0).toFixed(2)}%</div>
      </div>
    </div>
  `).join('');
  container.classList.add('active');
}

/* ═══════════════════════════════════════
   CHATBOT - MANTIDO
═══════════════════════════════════════ */
function toggleChat() {
  const win = document.getElementById('chatWindow');
  const badge = document.getElementById('chatBadge');
  win.classList.toggle('open');
  if(win.classList.contains('open')) {
    badge.style.display = 'none';
    if(document.getElementById('chatMessages').children.length === 0) {
      addBotMsg('Olá! Sou o CryptoBot 🤖 Pergunte sobre preços, airdrops, alpha ou pré-vendas!');
      showSuggestions();
    }
  }
}

function addBotMsg(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showSuggestions() {
  const sugs = document.getElementById('chatSugs');
  const sugList = ['Preço BTC', 'Airdrop ativo', 'Alpha call', 'Pré-venda'];
  sugs.innerHTML = sugList.map(s => `<button class="chat-sug" onclick="sendChat('${s}')">${s}</button>`).join('');
}

function sendChat(preset) {
  const input = document.getElementById('chatInput');
  const msg = preset || input.value.trim();
  if(!msg) return;

  addUserMsg(msg);
  input.value = '';

  // Typing
  const msgs = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg typing';
  typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addBotMsg(getBotReply(msg));
  }, 800);
}

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
  updateInterfaceLang();
  loadTab('news');
  loadMemecoins();
  setInterval(loadMemecoins, 30000);

  // Click fora fecha dropdowns
  document.addEventListener('click', (e) => {
    if(!e.target.closest('.lang-dropdown')) closeLang();
    if(!e.target.closest('.search-wrap')) closeResults();
  });
});
