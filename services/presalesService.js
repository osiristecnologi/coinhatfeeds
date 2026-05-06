// ─────────────────────────────────────────────
//  services/presalesService.js
//  Gerencia dados de pré-vendas de tokens
// ─────────────────────────────────────────────

// Dados mockados — substitua por integração real (e.g. DexScreener, CoinGecko)
const PRESALES_DATA = [
  {
    id: 'ps_001',
    name: 'HatDoge',
    symbol: 'HDOGE',
    logo: 'https://placehold.co/64x64/1a6bff/white?text=HD',
    description: {
      pt: 'O mais novo memecoin com utilidade real no ecossistema Solana.',
      en: 'The newest memecoin with real utility on the Solana ecosystem.',
      es: 'El nuevo memecoin con utilidad real en el ecosistema Solana.',
    },
    chain: 'solana',
    raised: 420000,
    goal: 800000,
    price: 0.0012,
    startDate: '2025-06-01T00:00:00Z',
    endDate:   '2025-07-01T00:00:00Z',
    status: 'active',   // active | upcoming | ended
    website: 'https://hatdoge.example.com',
    twitter: 'https://twitter.com/hatdoge',
  },
  {
    id: 'ps_002',
    name: 'PepeLord',
    symbol: 'PEPEL',
    logo: 'https://placehold.co/64x64/00b85c/white?text=PL',
    description: {
      pt: 'PepeLord é a evolução definitiva dos memecoins baseados em Pepe.',
      en: 'PepeLord is the ultimate evolution of Pepe-based memecoins.',
      es: 'PepeLord es la evolución definitiva de los memecoins basados en Pepe.',
    },
    chain: 'ethereum',
    raised: 1200000,
    goal: 2000000,
    price: 0.00054,
    startDate: '2025-06-15T00:00:00Z',
    endDate:   '2025-07-15T00:00:00Z',
    status: 'upcoming',
    website: 'https://pepelord.example.com',
    twitter: 'https://twitter.com/pepelord',
  },
];

function getPresales(status = null) {
  if (!status) return PRESALES_DATA;
  return PRESALES_DATA.filter(p => p.status === status);
}

function getPresaleById(id) {
  return PRESALES_DATA.find(p => p.id === id) || null;
}

module.exports = { getPresales, getPresaleById };
