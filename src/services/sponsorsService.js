// ─────────────────────────────────────────────
//  services/sponsorsService.js
//  Slots de patrocinadores pagos
// ─────────────────────────────────────────────

const SPONSORS_DATA = [
  {
    id: 'sp_001',
    name: 'CryptoExchange Pro',
    logo: 'https://placehold.co/120x48/1a6bff/white?text=CEPro',
    tagline: {
      pt: 'A exchange com as menores taxas da América Latina.',
      en: 'The exchange with the lowest fees in Latin America.',
      es: 'El exchange con las menores tarifas de Latinoamérica.',
    },
    url: 'https://cryptoexchange.example.com',
    badge: 'Parceiro Oficial',
    tier: 'gold',   // gold | silver | bronze
    active: true,
  },
  {
    id: 'sp_002',
    name: 'WalletSafe',
    logo: 'https://placehold.co/120x48/00b85c/white?text=WalletSafe',
    tagline: {
      pt: 'Guarde suas criptos com segurança militar.',
      en: 'Store your crypto with military-grade security.',
      es: 'Guarda tus criptos con seguridad de grado militar.',
    },
    url: 'https://walletsafe.example.com',
    badge: 'Segurança',
    tier: 'silver',
    active: true,
  },
];

function getSponsors(tier = null) {
  const active = SPONSORS_DATA.filter(s => s.active);
  if (!tier) return active;
  return active.filter(s => s.tier === tier);
}

module.exports = { getSponsors };
