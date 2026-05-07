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
   I18N - FUSÃO: ADICIONADO
═══════════════════════════════════════ */
const i18n = {
  pt: {
    // Interface
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
    // Chatbot
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
    kb: [
      {k: ['price','quote'], r: 'Check real-time price on the memecoin card. Click for chart.'},
      {k: ['airdrop','free'], r: 'Check Airdrops tab in menu ☰ for active campaigns.'},
      {k: ['alpha','call'], r: 'Alpha tab has exclusive community calls.'},
      {k: ['presale'], r: 'Presales listed in Presales tab with official links.'}
    ],
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
  document.getElementById('searchInput').placeholder = t('search');
  document.getElementById('dt-news').textContent = t('news');
  document.getElementById('dt-presales').textContent = t('presales');
  document.getElementById('dt-alpha').textContent = t('alpha');
  document.getElementById('dt-airdrops').textContent = t('airdrops');
  document.getElementById('dt-sponsors').textContent = t('sponsors');
  document.getElementById('nt-title').innerHTML = `<img src="data:image/png;base64,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
