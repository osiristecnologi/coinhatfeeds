const express = require('express');
const router = express.Router();

// GET /api/news
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      title: "Bitcoin rompe $70k",
      summary: "BTC atinge nova máxima após ETF approval",
      source: "CoinTelegraph",
      date: "2024-05-06",
      url: "https://cointelegraph.com/bitcoin-70k"
    },
    {
      id: 2,
      title: "Ethereum Dencun upgrade",
      summary: "Taxas de L2 caem 90% após atualização",
      source: "Decrypt",
      date: "2024-05-05",
      url: "https://decrypt.co/ethereum-dencun"
    },
    {
      id: 3,
      title: "Solana volta a travar",
      summary: "Rede fica offline por 5h durante pico de volume",
      source: "The Block",
      date: "2024-05-04",
      url: "https://theblock.co/solana-outage"
    }
  ]);
});

module.exports = router;
