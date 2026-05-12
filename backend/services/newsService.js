// ─────────────────────────────────────────────
// services/newsService.js
// ─────────────────────────────────────────────

const fetch = require('node-fetch');

const API_KEY = process.env.CRYPTOPANIC_API_KEY || '';

let cache = {
  data: [],
  ts: 0
};

const CACHE_TTL = 5 * 60 * 1000;

async function getNews() {
  const now = Date.now();

  // Cache
  if (cache.data.length && now - cache.ts < CACHE_TTL) {
    console.log('📦 Cache news');
    return cache.data;
  }

  let news = [];

  // 1. CryptoPanic
  try {
    news = await fetchCryptoPanic();

    if (news.length) {
      console.log('✅ CryptoPanic OK');

      cache = {
        data: news,
        ts: now
      };

      return news;
    }

  } catch (err) {
    console.error('❌ CryptoPanic:', err.message);
  }

  // 2. RSS fallback
  try {
    news = await fetchRSS();

    if (news.length) {
      console.log('✅ RSS OK');

      cache = {
        data: news,
        ts: now
      };

      return news;
    }

  } catch (err) {
    console.error('❌ RSS:', err.message);
  }

  // 3. Fake fallback
  console.log('⚠️ Usando fallback local');

  news = fakeNews();

  cache = {
    data: news,
    ts: now
  };

  return news;
}

// ─────────────────────────
// CryptoPanic
// ─────────────────────────

async function fetchCryptoPanic() {

  if (!API_KEY) {
    throw new Error('CRYPTOPANIC_API_KEY vazia');
  }

  const url =
    `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&public=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  const data = await response.json();

  return (data.results || [])
    .slice(0, 8)
    .map(item => ({
      title: item.title || 'Sem título',
      source: item.source?.title || 'CryptoPanic',
      summary: item.title || '',
      url: item.url || '#',
      publishedAt: item.published_at || new Date().toISOString(),
      category: mapCategory(item.title)
    }));
}

// ─────────────────────────
// RSS
// ─────────────────────────

async function fetchRSS() {

  const rss =
    'https://www.coindesk.com/arc/outboundfeeds/rss/';

  const url =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`RSS ${response.status}`);
  }

  const data = await response.json();

  return (data.items || [])
    .slice(0, 8)
    .map(item => ({
      title: item.title || 'Sem título',
      source: 'CoinDesk',
      summary: cleanHtml(item.description || ''),
      url: item.link || '#',
      publishedAt: item.pubDate || new Date().toISOString(),
      category: mapCategory(item.title)
    }));
}

// ─────────────────────────
// Local fallback
// ─────────────────────────

function fakeNews() {

  return [
    {
      title: 'Bitcoin volta a subir acima dos $100k',
      source: 'CoinHat',
      summary: 'Mercado reage positivamente após forte entrada institucional.',
      url: '#',
      publishedAt: new Date().toISOString(),
      category: 'bitcoin'
    },
    {
      title: 'Solana lidera volume entre memecoins',
      source: 'CoinHat',
      summary: 'Ecossistema SOL continua crescendo rapidamente.',
      url: '#',
      publishedAt: new Date().toISOString(),
      category: 'solana'
    }
  ];
}

// ─────────────────────────

function cleanHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').slice(0, 160);
}

function mapCategory(text = '') {

  const t = text.toLowerCase();

  if (t.includes('bitcoin') || t.includes('btc')) {
    return 'bitcoin';
  }

  if (t.includes('ethereum') || t.includes('eth')) {
    return 'ethereum';
  }

  if (t.includes('solana') || t.includes('sol')) {
    return 'solana';
  }

  if (t.includes('nft')) {
    return 'nft';
  }

  if (t.includes('defi')) {
    return 'defi';
  }

  return 'market';
}

module.exports = {
  getNews
};
