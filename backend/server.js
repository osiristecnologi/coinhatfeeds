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

// ROTAS QUE JÁ EXISTEM NA SUA PASTA /routes
app.use('/api/news', require('./routes/news'));
// Se tiver outros arquivos em /routes, adiciona aqui:
// app.use('/api/presales', require('./routes/presales'));

// ROTA /api/memes - CORRIGIDA PRA NÃO VIR SOL
app.get('/api/memes', async (req, res) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://dexscreener.com/'
    };

    const url = 'https://api.dexscreener.com/latest/dex/search?q=solana';
    
    const r = await fetch(url, { 
      timeout: 10000, 
      headers 
    });
    
    if (!r.ok) throw new Error(`DexScreener ${r.status}`);
    
    const json = await r.json();
    
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const data = json.pairs
      .filter(p => {
        const fdv = p.fdv || p.marketCap || 0;
        const liquidity = p.liquidity?.usd || 0;
        const created = p.pairCreatedAt || 0;
        const symbol = p.baseToken?.symbol?.toLowerCase() || '';
        const name = p.baseToken?.name?.toLowerCase() || '';
        
        return fdv >= 40000 && 
               liquidity >= 20000 && 
               created > thirtyDaysAgo &&
               p.chainId === 'solana' &&
               symbol !== 'sol' && 
               symbol !== 'usdc' && 
               symbol !== 'usdt' && 
               !name.includes('wrapped') &&
               p.baseToken && 
               p.priceUsd;
      })
      .sort((a, b) => (b.fdv || 0) - (a.fdv || 0))
      .slice(0, 18);

    res.json({ data });
    
  } catch(e) {
    console.error('Erro /api/memes:', e.message);
    res.status(500).json({ data: [], error: `Falha: ${e.message}` });
  }
});

// ROTAS MOCKADAS - SÓ USA SE NÃO TIVER ARQUIVO EM /routes
app.get('/api/presales', (req, res) => {
  res.json({ data: [] });
});

app.get('/api/alpha', (req, res) => {
  res.json({ data: [] });
});

app.get('/api/airdrops', (req, res) => {
  res.json({ data: [] });
});

app.get('/api/sponsors', (req, res) => {
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

process.on('uncaughtException', (err) => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('PROMISE REJEITADA:', err);
  process.exit(1);
});
