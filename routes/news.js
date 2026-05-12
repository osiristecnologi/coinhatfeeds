const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');

router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'pt';
    const source = req.query.source || 'all';
    const news = await newsService.getNews(lang, source);
    res.json(news);
  } catch (error) {
    console.error('Erro na rota /api/news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

module.exports = router;
