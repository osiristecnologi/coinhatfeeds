// routes/news.js
const express = require('express');
const { fetchNews } = require('../services/newsService');
const router = express.Router();

// GET /api/news?lang=pt
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'pt';
    const articles = await fetchNews(lang);
    res.json({ success: true, data: articles });
  } catch (err) {
    console.error('[news]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
