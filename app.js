// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {

  const translations = {
    pt: {
      chart: "Gráfico", site: "Site", buy: "Comprar", sell: "Vender",
      about: "Sobre", info_na: "Informações indisponíveis",
      lang_pt: "PT", lang_en: "EN", new_tokens: "Novos Tokens Solana 40k+"
    },
    en: {
      chart: "Chart", site: "Website", buy: "Buy", sell: "Sell",
      about: "About", info_na: "Information unavailable",
      lang_pt: "PT", lang_en: "EN", new_tokens: "New Solana Tokens 40k+"
    }
  };

  let currentLang = 'pt';
  let memesData = [];
  let jupiterModal, coinhatBotModal, buyModal;

  const getEl = (id) => document.getElementById(id);
  const mainTitle = getEl('mainTitle');
  const tokenCardsContainer = getEl('tokenCardsContainer');
  const hamburgerMenu = getEl('hamburgerMenu');
  const drawerMenu = getEl('drawerMenu');
  const drawerOverlay = getEl('drawerOverlay');
  const drawerClose = getEl('drawerClose');
  const searchInput = getEl('searchInput');

  const formatPrice = (p) =>!p? 'N/A' : (p < 0.0001? p.toExponential(2) : p.toLocaleString('en-US', {maximumFractionDigits: 8}));
  const formatMarketCap = (m) => {
    if (!m) return 'N/A';
    if (m >= 1e9) return `${(m/1e9).toFixed(2)}B`;
    if (m >= 1e6) return `${(m/1e6).toFixed(2)}M`;
    if (m >= 1e3) return `${(m/1e3).toFixed(2)}K`;
    return m.toFixed(2);
  };
  const formatPercent = (p) => p? `${p.toFixed(2)}%` : 'N/A';

  function updateTexts() {
    const t = translations[currentLang];
    if(mainTitle) mainTitle.textContent = t.new_tokens;
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.getAttribute('data-lang-key');
      if(t[key]) el.textContent = t[key];
    });
  }

  function renderTokens() {
    if (!tokenCardsContainer) return;
    tokenCardsContainer.innerHTML = '';

    memesData.forEach(token => {
      const priceChange = token.priceChange?.h24 || 0;
      const priceClass = priceChange >= 0? 'positive' : 'negative';
      const pricePrefix = priceChange >= 0? '+' : '';

      const card = document.createElement('div');
      card.className = 'token-card';
      card.innerHTML = `
        <div class="card-header">
          <div class="token-identity">
            <img src="${token.info?.imageUrl || 'https://via.placeholder.com/40'}" alt="${token.baseToken.symbol}" class="token-logo" onerror="this.src='https://via.placeholder.com/40'">
            <div class="token-name">
              <span class="symbol">${token.baseToken.symbol}</span>
              <span class="name">${token.baseToken.name}</span>
            </div>
          </div>
          <div class="price-info">
            <span class="price">$${formatPrice(parseFloat(token.priceUsd))}</span>
            <span class="price-change ${priceClass}">${pricePrefix}${formatPercent(priceChange)}</span>
          </div>
        <div class="card-body">
          <div class="stat"><span class="label">Market Cap</span><span class="value">$${formatMarketCap(token.fdv)}</span></div>
          <div class="stat"><span class="label">Liquidity</span><span class="value">$${formatMarketCap(token.liquidity?.usd)}</span></div>
          <div class="stat"><span class="label">Volume 24h</span><span class="value">$${formatMarketCap(token.volume?.h24)}</span></div>
        </div>
        <div class="card-actions">
          <button class="card-button" data-action="chart" data-pair="${token.pairAddress}">Gráfico</button>
          <button class="card-button" data-action="buy" data-address="${token.baseToken.address}">Comprar</button>
          <button class="card-button" data-action="sell" data-address="${token.baseToken.address}">Vender</button>
          <button class="card-button" data-action="about" data-token='${JSON.stringify(token)}'>Sobre</button>
        </div>
      `;
      tokenCardsContainer.appendChild(card);
    });
  }

  async function fetchMemes() {
    try {
      console.log('Buscando direto no DexScreener...');
      const url = 'https://api.dexscreener.com/latest/dex/search?q=solana';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`DexScreener ${response.status}`);

      const json = await response.json();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      memesData = json.pairs
      .filter(p => {
          const fdv = p.fdv || p.marketCap || 0;
          const liquidity = p.liquidity?.usd || 0;
          const created = p.pairCreatedAt || 0;
          const symbol = p.baseToken?.symbol?.toUpperCase() || '';
          const name = p.baseToken?.name?.toUpperCase() || '';

          return fdv >= 40000 &&
                 liquidity >= 10000 &&
                 created > thirtyDaysAgo &&
                 p.chainId === 'solana' &&
                 symbol!== 'SOL' &&
                 symbol!== 'USDC' &&
                 symbol!== 'USDT' &&
               !name.includes('WRAPPED') &&
                 p.priceUsd;
        })
      .sort((a, b) => (b.fdv || 0) - (a.fdv || 0))
      .slice(0, 18);

      console.log(`${memesData.length} tokens carregados`);
      renderTokens();

    } catch (error) {
      console.error("Erro ao buscar memes:", error);
      if (tokenCardsContainer) {
        tokenCardsContainer.innerHTML = `<p style="text-align:center;color:#ff5555;padding:20px;">Erro ao carregar tokens: ${error.message}</p>`;
      }
    }
  }

  function initModals() {
    jupiterModal = new bootstrap.Modal(getEl('jupiterModal'));
    coinhatBotModal = new bootstrap.Modal(getEl('coinhatBotModal'));
    buyModal = new bootstrap.Modal(getEl('buyModal'));
  }

  function openJupiterModal(address, mode) {
    const iframe = getEl('jupiterSwapIframe');
    const url = `https://jup.ag/swap/${mode === 'buy'? 'SOL' : address}-${mode === 'buy'? address : 'SOL'}`;
    iframe.src = url;
    buyModal.hide();
    jupiterModal.show();
  }

  function openCoinhatBot() {
    const iframe = getEl('coinhatBotIframe');
    iframe.src = 'https://coinhatbot.onrender.com';
    coinhatBotModal.show();
  }

  function openAboutModal(token) {
    const t = translations[currentLang];
    getEl('aboutModalLabel').textContent = `${t.about} ${token.baseToken.name}`;
    getEl('aboutTokenLogo').src = token.info?.imageUrl || 'https://via.placeholder.com/80';
    getEl('aboutTokenName').textContent = token.baseToken.name;
    getEl('aboutTokenSymbol').textContent = token.baseToken.symbol;

    const infoDiv = getEl('aboutTokenInfo');
    infoDiv.innerHTML = `
      <div class="stat-row"><span>Preço:</span><span>$${formatPrice(parseFloat(token.priceUsd))}</span></div>
      <div class="stat-row"><span>Market Cap:</span><span>$${formatMarketCap(token.fdv)}</span></div>
      <div class="stat-row"><span>Liquidez:</span><span>$${formatMarketCap(token.liquidity?.usd)}</span></div>
      <div class="stat-row"><span>Volume 24h:</span><span>$${formatMarketCap(token.volume?.h24)}</span></div>
      <div class="stat-row"><span>Variação 24h:</span><span class="${token.priceChange?.h24 >= 0? 'positive' : 'negative'}">${formatPercent(token.priceChange?.h24)}</span></div>
    `;

    const linksDiv = getEl('aboutTokenLinks');
    linksDiv.innerHTML = '';
    if (token.info?.websites?.length > 0) {
      token.info.websites.forEach(site => {
        linksDiv.innerHTML += `<a href="${site.url}" target="_blank" class="link-button"><i class="fas fa-globe"></i> ${site.label || 'Website'}</a>`;
      });
    }
    if (token.info?.socials?.length > 0) {
      token.info.socials.forEach(social => {
        linksDiv.innerHTML += `<a href="${social.url}" target="_blank" class="link-button"><i class="fab fa-${social.type}"></i> ${social.type}</a>`;
      });
    }
    if (linksDiv.innerHTML === '') {
      linksDiv.innerHTML = `<p style="color:#888;">${t.info_na}</p>`;
    }
    new bootstrap.Modal(getEl('aboutModal')).show();
  }

  function setupEventListeners() {
    hamburgerMenu?.addEventListener('click', () => {
      drawerMenu.classList.add('open');
      drawerOverlay.classList.add('open');
    });
    drawerClose?.addEventListener('click', () => {
      drawerMenu.classList.remove('open');
      drawerOverlay.classList.remove('open');
    });
    drawerOverlay?.addEventListener('click', () => {
      drawerMenu.classList.remove('open');
      drawerOverlay.classList.remove('open');
    });

    getEl('langPT')?.addEventListener('click', () => {
      currentLang = 'pt';
      updateTexts();
      renderTokens();
    });
    getEl('langEN')?.addEventListener('click', () => {
      currentLang = 'en';
      updateTexts();
      renderTokens();
    });

    searchInput?.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = memesData.filter(t =>
        t.baseToken.symbol.toLowerCase().includes(term) ||
        t.baseToken.name.toLowerCase().includes(term)
      );
      const temp = memesData;
      memesData = filtered;
      renderTokens();
      memesData = temp;
    });

    tokenCardsContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'chart') {
        window.open(`https://dexscreener.com/solana/${btn.dataset.pair}`, '_blank');
      }
      else if (action === 'buy' || action === 'sell') {
        getEl('buyModalLabel').textContent = `${action === 'buy'? 'Comprar' : 'Vender'} Token`;
        getEl('confirmBuyBtn').onclick = () => openJupiterModal(btn.dataset.address, action);
        buyModal.show();
      }
      else if (action === 'about') {
        openAboutModal(JSON.parse(btn.dataset.token));
      }
    });

    getEl('coinhatBotButton')?.addEventListener('click', openCoinhatBot);
  }

  async function init() {
    initModals();
    setupEventListeners();
    updateTexts();
    await fetchMemes();
    setInterval(fetchMemes, 60000);
  }

  init();
});
