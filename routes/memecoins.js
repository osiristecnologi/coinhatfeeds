// routes/memecoins.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

let _cache = { data: null, ts: 0 };
const CACHE_TTL = 2 * 60 * 1000; // 2min cache

router.get('/', async (req, res) => {
  const now = Date.now();
  
  if (_cache.data && now - _cache.ts < CACHE_TTL) {
    return res.json(_cache.data);
  }

  try {
    // DexScreener - pega memecoins da Solana
    const url = 'https://api.dexscreener.com/latest/dex/tokens/solana';
    const response = await fetch(url);
    const data = await response.json();
    
    // Filtra só memecoin com volume
    const coins = (data.pairs || [])
      .filter(p => p.baseToken && p.volume?.h24 > 10000)
      .sort((a, b) => b.volume.h24 - a.volume.h24)
      .slice(0, 20)
      .map(p => ({
        id: p.baseToken.address,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        image: p.info?.imageUrl || '',
        price: parseFloat(p.priceUsd || 0),
        change: parseFloat(p.priceChange?.h24 || 0),
        volume: p.volume?.h24 || 0,
        liquidity: p.liquidity?.usd || 0,
        marketCap: p.fdv || 0,
        address: p.baseToken.address
      }));
    
    _cache = { data: coins, ts: now };
    res.json(coins);
    
  } catch (err) {
    console.error('Erro DexScreener:', err.message);
    
    // Fallback: CoinGecko
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=volume_desc&per_page=20&sparkline=false';
      const response = await fetch(url);
      const data = await response.json();
      
      const coins = data.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        image: c.image,
        price: c.current_price,
        change: c.price_change_percentage_24h,
        volume: c.total_volume,
        liquidity: 0,
        marketCap: c.market_cap,
        address: c.id
      }));
      
      _cache = { data: coins, ts: now };
      res.json(coins);
      
    } catch (err2) {
      res.status(500).json({ error: 'Erro ao buscar memecoins', data: _cache.data || [] });
    }
  }
});

module.exports = router;
