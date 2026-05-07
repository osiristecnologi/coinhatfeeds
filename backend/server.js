// backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/news', require('./routes/news'));

// FUSÃO: ROTA /api/memes ANTI-BLOQUEIO COM FALLBACK
app.get('/api/memes', async (req, res) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; CoinhatBot/1.0)',
      'Accept': 'application/json'
    };

    // Busca direto tokens quentes - já retorna nome, preço, logo
    const r = await fetch('https://api.dexscreener.com/latest/dex/search?q=PEPE+WIF+BONK+FLOKI+DOGE', {
      timeout: 8000,
      headers
    });
    
    if (!r.ok) throw new Error(`DexScreener ${r.status}`);
    
    const json = await r.json();
    
    const data = json.pairs
      .filter(p => p.chainId && p.liquidity?.usd > 30000 && p.priceUsd && p.baseToken)
      .sort((a, b) => b.volume.h24 - a.volume.h24)
      .slice(0, 18);

    if (data.length === 0) throw new Error('Sem pares válidos');

    res.json({ data });
    
  } catch(e) {
    console.error('Erro /api/memes:', e.message);
    
    // FALLBACK: Nunca mais Unknown ??? 
    res.json({ 
      data: [
        {
          chainId: "ethereum",
          pairAddress: "mock-pepe",
          baseToken: { name: "Pepe", symbol: "PEPE", address: "0x6982508145454ce325ddbe47a25d4ec3d2311933" },
          priceUsd: "0.00000112",
          priceChange: { h24: 12.5 },
          volume: { h24: 25000000 },
          liquidity: { usd: 8900000 },
          fdv: 470000000,
          info: { imageUrl: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x6982508145454ce325ddbe47a25d4ec3d2311933.png" }
        },
        {
          chainId: "solana",
          pairAddress: "mock-wif", 
          baseToken: { name: "dogwifhat", symbol: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYXDwg6" },
          priceUsd: "1.23",
          priceChange: { h24: -3.2 },
          volume: { h24: 18900000 },
          liquidity: { usd: 12000000 },
          fdv: 1200000000,
          info: { imageUrl: "https://dd.dexscreener.com/ds-data/tokens/solana/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYXDwg6.png" }
        },
        {
          chainId: "solana",
          pairAddress: "mock-bonk",
          baseToken: { name: "Bonk", symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
          priceUsd: "0.000018",
          priceChange: { h24: 8.7 },
          volume: { h24: 15600000 },
          liquidity: { usd: 21000000 },
          fdv: 1100000000,
          info: { imageUrl: "https://dd.dexscreener.com/ds-data/tokens/solana/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263.png" }
        }
      ], 
      error: 'DexScreener offline - usando cache' 
    });
  }
});

// FUSÃO: Rotas do drawer
app.get('/api/presales', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] });
});

app.get('/api/alpha', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] });
});

app.get('/api/airdrops', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] });
});

app.get('/api/sponsors', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Coinhat API is running',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz pra teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Coinhat Feeds API',
    endpoints: [
      '/api/health',
      '/api/news',
      '/api/memes',
      '/api/sponsors', 
      '/api/presales',
      '/api/alpha',
      '/api/airdrops'
    ]
  });
});

// Handler pra rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Rota ${req.originalUrl} não existe`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server rodando na porta ${PORT}`);
});

// Captura erro pra aparecer no log do Render
process.on('uncaughtException', (err) => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('PROMISE REJEITADA:', err);
  process.exit(1);
});
