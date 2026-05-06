// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const presalesRouter = require('./routes/presales');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Frontend estático
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/api/presales', presalesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running'
  });
});

// SPA fallback (sempre por último)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server rodando na porta ${PORT}`);
});
