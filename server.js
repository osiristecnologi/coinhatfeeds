const fs = require('fs');
const path = require('path');
console.log('=== DEBUG RENDER ===');
console.log('PWD:', process.cwd());
console.log('DIRNAME:', __dirname);
try {
  console.log('CONTEUDO DE SRC:', fs.readdirSync(__dirname));
  console.log('CONTEUDO DE SERVICES:', fs.readdirSync(path.join(__dirname, 'services')));
  console.log('EXISTE O ARQUIVO?', fs.existsSync(path.join(__dirname, 'services/presalesService.js')));
} catch (e) {
  console.log('ERRO NO DEBUG:', e.message);
}
console.log('=== FIM DEBUG ===');

const express = require('express');
const presalesRoutes = require('./routes/presales'); // essa linha só depois do debug
// resto do código...
//  CoinHatFeeds · Backend Server
//  Node.js + Express
// ─────────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const newsRouter      = require('./routes/news');
const presalesRouter  = require('./routes/presales');
const alphaRouter     = require('./routes/alpha');
const airdropsRouter  = require('./routes/airdrops');
const sponsorsRouter  = require('./routes/sponsors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend estático em produção
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ──────────────────────────────
app.use('/api/news',      newsRouter);
app.use('/api/presales',  presalesRouter);
app.use('/api/alpha',     alphaRouter);
app.use('/api/airdrops',  airdropsRouter);
app.use('/api/sponsors',  sponsorsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback → index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅  CoinHatFeeds backend rodando em http://localhost:${PORT}`);
});

module.exports = app;

