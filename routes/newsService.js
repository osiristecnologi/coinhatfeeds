// ─────────────────────────────────────────────
//  services/newsService.js
//  Notícias cripto (API pública + fallback + cache)
// ─────────────────────────────────────────────

const fetch = require('node-fetch');

// 🔑 API KEY (opcional mas recomendado)
const API_KEY = process.env.CRYPTOPANIC_API_KEY;

// Cache em memória
let _cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function fetchNews(lang = 'pt') {
  const now = Date.now();

  // ⚡ 1. Cache primeiro (super importante)
  if (_cache.data && now - _cache.ts < CACHE_TTL) {
    return _cache.data;
  }

  try {
    // 🚀 2. Fonte principal → CryptoPanic
    const primary = await fetchCryptoPanic();

    if (primary.length > 0) {
      _cache = { data: primary, ts: now };
      return primary;
    }

    throw new Error('CryptoPanic vazio');

  } catch (err) {
    console.warn('⚠️ Falha na API principal:', err.message);

    try {
      // 🔄 3. Fallback → RSS CoinDesk
      const fallback = await fetchCoinDeskRSS();

      if (fallback.length > 0) {
        _cache = { data: fallback, ts: now };
        return fallback;
      }

      throw new Error('RSS vazio');

    } catch (err2) {
      console.error('❌ Fallback também falhou:', err2.message);

      // 🧠 4. Último recurso → cache antigo
      return _cache.data || [];
    }
  }
}

// ─────────────────────────────────────────────
//  📰 CryptoPanic (fonte principal)
// ─────────────────────────────────────────────
async function fetchCryptoPanic() {
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&public=true&kind=news&filter=hot`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CryptoPanic ${res.status}`);

  const data = await res.json();

  return (data.results || []).slice(0, 8).map(item => ({
    title: item.title,
    source: item.source?.title || 'CryptoPanic',
    summary: item.title,
    url: item.url,
    publishedAt: item.published_at || '',
    category: mapCategory(item.title)
  }));
}

// ─────────────────────────────────────────────
//  📰 CoinDesk RSS (fallback)
// ─────────────────────────────────────────────
async function fetchCoinDeskRSS() {
  const url = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS ${res.status}`);

  const data = await res.json();

  return (data.items || []).slice(0, 8).map(item => ({
    title: item.title,
    source: 'CoinDesk',
    summary: item.description.replace(/<[^>]+>/g, '').slice(0, 140),
    url: item.link,
    publishedAt: item.pubDate || '',
    category: mapCategory(item.title)
  }));
}

// ─────────────────────────────────────────────
//  🧠 Classificação simples
// ─────────────────────────────────────────────
function mapCategory(text = '') {
  const t = text.toLowerCase();

  if (t.includes('bitcoin') || t.includes('btc')) return 'bitcoin';
  if (t.includes('ethereum') || t.includes('eth')) return 'ethereum';
  if (t.includes('solana') || t.includes('sol')) return 'solana';
  if (t.includes('defi')) return 'defi';
  if (t.includes('regulation') || t.includes('sec')) return 'regulation';
  if (t.includes('nft')) return 'nft';

  return 'market';
}

module.exports = { fetchNews };
