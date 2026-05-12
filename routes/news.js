const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');

router.get('/', async (req, res) => {
  try {
    const news = await newsService.getNews();
    res.json(news);
  } catch (error) {
    console.error('Erro na rota /api/news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

module.exports = router;
