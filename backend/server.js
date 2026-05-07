// backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // FUSÃO: ADICIONADO pra buscar DexScreener

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// FUSÃO: ADICIONADO - Serve os arquivos do frontend
app.use(express.static('public')); 

// API Routes - só descomenta se o arquivo existir
// app.use('/api/presales', require('./routes/presales'));
app.use('/api/news', require('./routes/news'));
// app.use('/api/sponsors', require('./routes/sponsors'));

// FUSÃO: ADICIONADO - Rota das memecoins pra resolver CORS e skeleton
app.get('/api/memes', async (req, res) => {
  try {
    const r = await fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
      timeout: 5000
    });
    const data = await r.json();
    res.json({ data: data.slice(0, 18) });
  } catch(e) {
    console.error('Erro /api/memes:', e);
    res.status(500).json({ data: [], error: 'DexScreener offline' });
  }
});

// FUSÃO: ADICIONADO - Rotas do drawer que faltavam
app.get('/api/presales', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] }); // Tu popula depois no ./routes/presales
});

app.get('/api/alpha', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] }); // Tu popula depois
});

app.get('/api/airdrops', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] }); // Tu popula depois
});

app.get('/api/sponsors', (req, res) => {
  const lang = req.query.lang || 'pt';
  res.json({ data: [] }); // Tu popula depois
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

// Start server - OBRIGATÓRIO usar process.env.PORT no Render
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
