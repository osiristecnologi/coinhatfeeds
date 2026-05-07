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

// ROTA /api/memes - BOOST + GEMAS 40K+ PRA CIMA
app.get('/api/memes', async (req, res) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 CoinhatBot/1.0',
      'Accept': 'application/json'
    };

    // PASSO 1: Pega tokens em BOOST hoje
    const boostRes = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      timeout: 8000,
      headers
    });
    
    if (!boostRes.ok) throw new Error(`Boost ${boostRes.status}`);
    const boosts = await boostRes.json();
    
    if (!boosts.length) throw new Error('Sem boosts hoje');

    // PASSO 2: Monta lista chain/token pra buscar dados completos
    const pairs = boosts.slice(0, 30).map(b => `${b.chainId}/${b.tokenAddress}`).join(',');
    
    // PASSO 3: Busca dados dos tokens em boost
    const tokensRes = await fetch(`https://api.dexscreener.com/tokens/v1/${pairs}`, {
      timeout: 8000,
      headers
    });
    
    if (!tokensRes.ok) throw new Error(`Tokens ${tokensRes.status}`);
    const tokensData = await tokensRes.json();
    
    // PASSO 4: FILTRO 40K+ PRA CIMA
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const data = tokensData
      .flat()
      .filter(p => {
        const fdv = p.fdv || p.marketCap || 0;
        const liquidity = p.liquidity?.usd || 0;
        const created = p.pairCreatedAt || 0;
        
        return fdv >= 40000 &&           // 40K PRA CIMA
               liquidity >= 20000 &&     // Liquidez mínima 20k
               created > thirtyDaysAgo && // Só criadas últimos 30 dias
               p.baseToken && 
               p.priceUsd;
      })
      .sort((a, b) => b.fdv - a.fdv) // Maior MC primeiro
      .slice(0, 18);

    if (data.length === 0) throw new Error('Nenhuma gema 40k+ com boost encontrada');

    res.json({ data });
    
  } catch(e) {
    console.error('Erro /api/memes:', e.message);
    
    // FALLBACK: Se boost falhar, busca direto as novas 40k+
    try {
      const headers = { 'User-Agent': 'Mozilla/5.0 CoinhatBot/1.0' };
      const r = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana', { headers });
      const json = await r.json();
      
      const fallbackData = json.pairs
        .filter(p => {
          const fdv = p.fdv || p.marketCap || 0;
          const created = p.pairCreatedAt || 0;
          return fdv >= 40000 && 
                 p.liquidity?.usd >= 20000 &&
                 created > Date.now() - 30 * 24 * 60 * 60 * 1000;
        })
        .sort((a, b) => b.fdv - a.fdv)
        .slice(0, 18);
      
      res.json({ data: fallbackData, error: 'Boost offline - usando busca direta 40k+' });
      
    } catch {
      res.json({ data: [], error: 'DexScreener offline' });
    }
  }
});

// Rotas do drawer
app.get('/api/presales', (req, res) => {
  res.json({ data: [] });
});

app.get('/api/alpha
