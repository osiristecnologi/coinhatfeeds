// public/js/app.js

document.addEventListener('DOMContentLoaded', () => {

  const translations = {

    pt: {
      chart: "Gráfico",
      site: "Site",
      buy: "Comprar",
      sell: "Vender",
      about: "Sobre",
      info_na: "Informações indisponíveis",
      lang_pt: "PT",
      lang_en: "EN",
      new_tokens: "Novos Tokens Solana 40k+"
    },

    en: {
      chart: "Chart",
      site: "Website",
      buy: "Buy",
      sell: "Sell",
      about: "About",
      info_na: "Information unavailable",
      lang_pt: "PT",
      lang_en: "EN",
      new_tokens: "New Solana Tokens 40k+"
    }

  };

  let currentLang = 'pt';
  let memesData = [];
  let allMemesData = [];

  let jupiterModal;
  let coinhatBotModal;
  let buyModal;

  const getEl = (id) => document.getElementById(id);

  const mainTitle = getEl('mainTitle');
  const tokenCardsContainer = getEl('tokenCardsContainer');
  const hamburgerMenu = getEl('hamburgerMenu');
  const drawerMenu = getEl('drawerMenu');
  const drawerOverlay = getEl('drawerOverlay');
  const drawerClose = getEl('drawerClose');
  const searchInput = getEl('searchInput');

  // =========================
  // FORMATTERS
  // =========================

  const formatPrice = (p) => {

    if (!p || isNaN(p)) return 'N/A';

    return p < 0.0001
      ? Number(p).toExponential(2)
      : Number(p).toLocaleString('en-US', {
          maximumFractionDigits: 8
        });
  };

  const formatMarketCap = (m) => {

    if (!m || isNaN(m)) return 'N/A';

    if (m >= 1e9) return `${(m / 1e9).toFixed(2)}B`;
    if (m >= 1e6) return `${(m / 1e6).toFixed(2)}M`;
    if (m >= 1e3) return `${(m / 1e3).toFixed(2)}K`;

    return Number(m).toFixed(2);
  };

  const formatPercent = (p) => {

    if (p === undefined || p === null || isNaN(p)) {
      return 'N/A';
    }

    return `${Number(p).toFixed(2)}%`;
  };

  // =========================
  // UPDATE TEXTS
  // =========================

  function updateTexts() {

    const t = translations[currentLang];

    if (mainTitle) {
      mainTitle.textContent = t.new_tokens;
    }

    document.querySelectorAll('[data-lang-key]').forEach(el => {

      const key = el.getAttribute('data-lang-key');

      if (t[key]) {
        el.textContent = t[key];
      }

    });

  }

  // =========================
  // RENDER TOKENS
  // =========================

  function renderTokens() {

    if (!tokenCardsContainer) return;

    tokenCardsContainer.innerHTML = '';

    if (!memesData.length) {

      tokenCardsContainer.innerHTML = `
        <div style="
          text-align:center;
          padding:30px;
          color:#999;
        ">
          Nenhum token encontrado
        </div>
      `;

      return;
    }

    memesData.forEach(token => {

      try {

        const priceChange = token.priceChange?.h24 || 0;

        const priceClass =
          priceChange >= 0
            ? 'positive'
            : 'negative';

        const pricePrefix =
          priceChange >= 0
            ? '+'
            : '';

        const safeToken = encodeURIComponent(
          JSON.stringify(token)
        );

        const card = document.createElement('div');

        card.className = 'token-card';

        // =========================
        // HTML
        // =========================

        card.innerHTML = `

          <div class="card-header">

            <div class="token-identity">

              <img
                src="${token.info?.imageUrl || 'https://via.placeholder.com/40'}"
                alt="${token.baseToken?.symbol || 'TOKEN'}"
                class="token-logo"
                onerror="this.src='https://via.placeholder.com/40'"
              >

              <div class="token-name">

                <span class="symbol">
                  ${token.baseToken?.symbol || '---'}
                </span>

                <span class="name">
                  ${token.baseToken?.name || 'Unknown'}
                </span>

              </div>

            </div>

            <div class="price-info">

              <span class="price">
                $${formatPrice(parseFloat(token.priceUsd))}
              </span>

              <span class="price-change ${priceClass}">
                ${pricePrefix}${formatPercent(priceChange)}
              </span>

            </div>

          </div>

          <div class="card-body">

            <div class="stat">
              <span class="label">Market Cap</span>
              <span class="value">
                $${formatMarketCap(token.fdv)}
              </span>
            </div>

            <div class="stat">
              <span class="label">Liquidity</span>
              <span class="value">
                $${formatMarketCap(token.liquidity?.usd)}
              </span>
            </div>

            <div class="stat">
              <span class="label">Volume 24h</span>
              <span class="value">
                $${formatMarketCap(token.volume?.h24)}
              </span>
            </div>

          </div>

          <div class="card-actions">

            <button
              class="card-button"
              data-action="chart"
              data-pair="${token.pairAddress}"
            >
              📈 Gráfico
            </button>

            <button
              class="card-button"
              data-action="buy"
              data-address="${token.baseToken?.address}"
            >
              🟢 Comprar
            </button>

            <button
              class="card-button"
              data-action="sell"
              data-address="${token.baseToken?.address}"
            >
              🔴 Vender
            </button>

            <button
              class="card-button"
              data-action="about"
              data-token="${safeToken}"
            >
              ℹ️ Sobre
            </button>

          </div>

        `;

        tokenCardsContainer.appendChild(card);

      } catch (err) {

        console.error('Erro render token:', err);

      }

    });

  }

  // =========================
  // FETCH TOKENS
  // =========================

  async function fetchMemes() {

    try {

      console.log('Buscando DexScreener...');

      tokenCardsContainer.innerHTML = `
        <div class="loading-box">
          Carregando tokens...
        </div>
      `;

      const url =
        'https://api.dexscreener.com/latest/dex/search?q=solana';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`DexScreener ${response.status}`);
      }

      const json = await response.json();

      if (!json.pairs || !Array.isArray(json.pairs)) {
        throw new Error('Pairs inválidos');
      }

      const thirtyDaysAgo =
        Date.now() - 30 * 24 * 60 * 60 * 1000;

      memesData = json.pairs
        .filter(p => {

          const fdv =
            p.fdv || p.marketCap || 0;

          const liquidity =
            p.liquidity?.usd || 0;

          const created =
            p.pairCreatedAt || 0;

          const symbol =
            p.baseToken?.symbol?.toUpperCase() || '';

          const name =
            p.baseToken?.name?.toUpperCase() || '';

          return (
            fdv >= 40000 &&
            liquidity >= 10000 &&
            created > thirtyDaysAgo &&
            p.chainId === 'solana' &&
            symbol !== 'SOL' &&
            symbol !== 'USDC' &&
            symbol !== 'USDT' &&
            !name.includes('WRAPPED') &&
            p.priceUsd
          );

        })
        .sort((a, b) => (b.fdv || 0) - (a.fdv || 0))
        .slice(0, 18);

      allMemesData = [...memesData];

      console.log(`${memesData.length} tokens carregados`);

      renderTokens();

    } catch (error) {

      console.error('Erro fetch:', error);

      tokenCardsContainer.innerHTML = `
        <div style="
          color:#ff5555;
          text-align:center;
          padding:30px;
        ">
          ❌ Erro ao carregar tokens
          <br><br>
          ${error.message}
        </div>
      `;
    }

  }

  // =========================
  // INIT MODALS
  // =========================

  function initModals() {

    if (typeof bootstrap === 'undefined') {

      console.warn('Bootstrap não carregado');

      return;
    }

    try {

      jupiterModal =
        new bootstrap.Modal(getEl('jupiterModal'));

      coinhatBotModal =
        new bootstrap.Modal(getEl('coinhatBotModal'));

      buyModal =
        new bootstrap.Modal(getEl('buyModal'));

    } catch (err) {

      console.error('Erro modals:', err);

    }

  }

  // =========================
  // JUPITER
  // =========================

  function openJupiterModal(address, mode) {

    const iframe = getEl('jupiterSwapIframe');

    if (!iframe) {
      alert('Iframe swap não encontrado');
      return;
    }

    const url =
      `https://jup.ag/swap/${
        mode === 'buy'
          ? 'SOL'
          : address
      }-${
        mode === 'buy'
          ? address
          : 'SOL'
      }`;

    iframe.src = url;

    if (buyModal) {
      buyModal.hide();
    }

    if (jupiterModal) {
      jupiterModal.show();
    }

  }

  // =========================
  // BOT
  // =========================

  function openCoinhatBot() {

    const iframe =
      getEl('coinhatBotIframe');

    if (iframe) {
      iframe.src =
        'https://coinhatbot.onrender.com';
    }

    if (coinhatBotModal) {
      coinhatBotModal.show();
    }

  }

  // =========================
  // ABOUT
  // =========================

  function openAboutModal(token) {

    try {

      const t = translations[currentLang];

      getEl('aboutModalLabel').textContent =
        `${t.about} ${token.baseToken?.name}`;

      getEl('aboutTokenLogo').src =
        token.info?.imageUrl ||
        'https://via.placeholder.com/80';

      getEl('aboutTokenName').textContent =
        token.baseToken?.name || 'Unknown';

      getEl('aboutTokenSymbol').textContent =
        token.baseToken?.symbol || '---';

      const infoDiv =
        getEl('aboutTokenInfo');

      infoDiv.innerHTML = `
        <div class="stat-row">
          <span>Preço:</span>
          <span>$${formatPrice(parseFloat(token.priceUsd))}</span>
        </div>

        <div class="stat-row">
          <span>Market Cap:</span>
          <span>$${formatMarketCap(token.fdv)}</span>
        </div>

        <div class="stat-row">
          <span>Liquidez:</span>
          <span>$${formatMarketCap(token.liquidity?.usd)}</span>
        </div>

        <div class="stat-row">
          <span>Volume 24h:</span>
          <span>$${formatMarketCap(token.volume?.h24)}</span>
        </div>
      `;

      new bootstrap.Modal(
        getEl('aboutModal')
      ).show();

    } catch (err) {

      console.error('Erro modal about:', err);

    }

  }

  // =========================
  // EVENTS
  // =========================

  function setupEventListeners() {

    hamburgerMenu?.addEventListener('click', () => {

      drawerMenu?.classList.add('open');
      drawerOverlay?.classList.add('open');

    });

    drawerClose?.addEventListener('click', () => {

      drawerMenu?.classList.remove('open');
      drawerOverlay?.classList.remove('open');

    });

    drawerOverlay?.addEventListener('click', () => {

      drawerMenu?.classList.remove('open');
      drawerOverlay?.classList.remove('open');

    });

    // LANG

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

    // SEARCH

    searchInput?.addEventListener('input', (e) => {

      const term =
        e.target.value.toLowerCase();

      if (!term) {

        memesData = [...allMemesData];

      } else {

        memesData = allMemesData.filter(t =>

          t.baseToken?.symbol
            ?.toLowerCase()
            .includes(term)

          ||

          t.baseToken?.name
            ?.toLowerCase()
            .includes(term)

        );

      }

      renderTokens();

    });

    // BUTTONS

    tokenCardsContainer?.addEventListener('click', (e) => {

      const btn =
        e.target.closest('[data-action]');

      if (!btn) return;

      const action =
        btn.dataset.action;

      // CHART

      if (action === 'chart') {

        window.open(
          `https://dexscreener.com/solana/${btn.dataset.pair}`,
          '_blank'
        );

      }

      // BUY / SELL

      else if (
        action === 'buy' ||
        action === 'sell'
      ) {

        const title =
          action === 'buy'
            ? 'Comprar Token'
            : 'Vender Token';

        getEl('buyModalLabel').textContent =
          title;

        getEl('confirmBuyBtn').onclick =
          () => openJupiterModal(
            btn.dataset.address,
            action
          );

        if (buyModal) {
          buyModal.show();
        }

      }

      // ABOUT

      else if (action === 'about') {

        const token =
          JSON.parse(
            decodeURIComponent(
              btn.dataset.token
            )
          );

        openAboutModal(token);

      }

    });

    // BOT

    getEl('coinhatBotButton')
      ?.addEventListener(
        'click',
        openCoinhatBot
      );

  }

  // =========================
  // INIT
  // =========================

  async function init() {

    console.log('CoinHatFeeds iniciado');

    initModals();

    setupEventListeners();

    updateTexts();

    await fetchMemes();

    setInterval(fetchMemes, 60000);

  }

  init();

});
