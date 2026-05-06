// ─────────────────────────────────────────────
//  services/newsService.js
//  Notícias cripto (API pública + fallback + cache)
// ─────────────────────────────────────────────

// Node 18+ / 24 já tem fetch nativo
const fetch = global.fetch;

// 🔑 opcional (funciona sem, mas melhora qualidade)
const API_KEY = process.env.CRYPTOPANIC_API_KEY;

// Cache (5 min)
let _cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000;

// ─────────────────────────────
// MAIN
// ─────────────────────────────
async function fetchNews(lang = 'pt') {
  const now = Date.now();

  // ⚡ cache
  if (_cache.data && now - _cache.ts < CACHE_TTL) {
    return _cache.data;
  }

  try {
    const news = await fetchCryptoPanic();

    if (news.length > 0) {
      _cache = { data: news, ts: now };
      return news;
    }

    throw new Error('Sem dados CryptoPanic');
  } catch (err) {
    console.warn('⚠️ CryptoPanic falhou:', err.message);

    try {
      const fallback = await fetchRSS();

      if (fallback.length > 0) {
        _cache = { data: fallback, ts: now };
        return fallback;
      }

      throw new Error('RSS vazio');
    } catch (err2) {
      console.error('❌ Falha total:', err2.message);

      return _cache.data || [];
    }
  }
}

// ─────────────────────────────
// CryptoPanic
// ─────────────────────────────
async function fetchCryptoPanic() {
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&public=true&kind=news&filter=hot`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CryptoPanic error ${res.status}`);

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

// ─────────────────────────────
// RSS fallback (CoinDesk)
// ─────────────────────────────
async function fetchRSS() {
  const url =
    'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS error ${res.status}`);

  const data = await res.json();

  return (data.items || []).slice(0, 8).map(item => ({
    title: item.title,
    source: 'CoinDesk',
    summary: item.description
      ? item.description.replace(/<[^>]+>/g, '').slice(0, 140)
      : '',
    url: item.link,
    publishedAt: item.pubDate || '',
    category: mapCategory(item.title)
  }));
}

// ─────────────────────────────
// Categoria automática
// ─────────────────────────────
function mapCategory(text = '') {
  const t = text.toLowerCase();

  if (t.includes('bitcoin') || t.includes('btc')) return 'bitcoin';
  if (t.includes('ethereum') || t.includes('eth')) return 'ethereum';
  if (t.includes('solana') || t.includes('sol')) return 'solana';
  if (t.includes('defi')) return 'defi';
  if (t.includes('sec') || t.includes('regulation')) return 'regulation';
  if (t.includes('nft')) return 'nft';

  return 'market';
}

module.exports = { fetchNews };
