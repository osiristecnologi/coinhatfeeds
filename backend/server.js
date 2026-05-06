// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes - só descomenta se o arquivo existir
// app.use('/api/presales', require('./routes/presales'));
app.use('/api/news', require('./routes/news'));
// app.use('/api/sponsors', require('./routes/sponsors'));

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
      '/api/sponsors', 
      '/api/presales'
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
