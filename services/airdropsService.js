// ─────────────────────────────────────────────
//  services/airdropsService.js
//  Listagem de Airdrops
// ─────────────────────────────────────────────

const AIRDROPS_DATA = [
  {
    id: 'ad_001',
    name: 'SolanaFi Airdrop',
    logo: 'https://placehold.co/64x64/9945FF/white?text=SF',
    description: {
      pt: 'Conecte sua carteira Phantom e complete tarefas para ganhar tokens SFI.',
      en: 'Connect your Phantom wallet and complete tasks to earn SFI tokens.',
      es: 'Conecta tu wallet Phantom y completa tareas para ganar tokens SFI.',
    },
    chain: 'solana',
    reward: '500 SFI',
    rewardUsd: 120,
    tasks: [
      { type: 'twitter_follow', label: 'Seguir no Twitter' },
      { type: 'telegram_join',  label: 'Entrar no Telegram' },
      { type: 'wallet_connect', label: 'Conectar carteira' },
    ],
    status: 'active',
    endDate: '2025-08-01T00:00:00Z',
    url: 'https://solanafit.example.com/airdrop',
  },
  {
    id: 'ad_002',
    name: 'MegaPepe Drop',
    logo: 'https://placehold.co/64x64/00e676/333?text=MP',
    description: {
      pt: 'Segure 100 PEPE por 7 dias e receba tokens MegaPepe gratuitamente.',
      en: 'Hold 100 PEPE for 7 days and receive free MegaPepe tokens.',
      es: 'Mantén 100 PEPE por 7 días y recibe tokens MegaPepe gratis.',
    },
    chain: 'ethereum',
    reward: '10,000 MPEPE',
    rewardUsd: 45,
    tasks: [
      { type: 'hold_token',     label: 'Segurar PEPE' },
      { type: 'discord_join',   label: 'Entrar no Discord' },
    ],
    status: 'upcoming',
    endDate: '2025-09-01T00:00:00Z',
    url: 'https://megapepe.example.com/airdrop',
  },
];

function getAirdrops(status = null) {
  if (!status) return AIRDROPS_DATA;
  return AIRDROPS_DATA.filter(a => a.status === status);
}

module.exports = { getAirdrops };
