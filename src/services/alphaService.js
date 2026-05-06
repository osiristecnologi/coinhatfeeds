// ─────────────────────────────────────────────
//  services/alphaService.js
//  Sinais alpha / insider tips
// ─────────────────────────────────────────────

const ALPHA_DATA = [
  {
    id: 'a_001',
    title: {
      pt: '🔥 Token X acumulando antes do listing',
      en: '🔥 Token X accumulating before listing',
      es: '🔥 Token X acumulando antes del listing',
    },
    body: {
      pt: 'Carteiras whales acumularam +40M de tokens nas últimas 24h. Listing confirmado na Binance para a próxima semana.',
      en: 'Whale wallets accumulated +40M tokens in the last 24h. Binance listing confirmed for next week.',
      es: 'Ballenas acumularon +40M tokens en 24h. Listing en Binance confirmado para la próxima semana.',
    },
    tag: 'whale',       // whale | listing | defi | nft | trend
    risk: 'high',       // low | medium | high
    chain: 'solana',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: 'On-chain Analysis',
  },
  {
    id: 'a_002',
    title: {
      pt: '📈 DeFi protocolo Y com TVL explodindo',
      en: '📈 DeFi protocol Y with exploding TVL',
      es: '📈 Protocolo DeFi Y con TVL en explosión',
    },
    body: {
      pt: 'TVL do protocolo Y subiu 300% em 48h. Nova parceria com fundo tier-1 será anunciada em breve.',
      en: 'Protocol Y TVL rose 300% in 48h. New partnership with tier-1 fund to be announced soon.',
      es: 'TVL del protocolo Y subió 300% en 48h. Nueva alianza con fondo tier-1 pronto.',
    },
    tag: 'defi',
    risk: 'medium',
    chain: 'ethereum',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: 'DeFiLlama Signals',
  },
];

function getAlpha() {
  return ALPHA_DATA.sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

module.exports = { getAlpha };
