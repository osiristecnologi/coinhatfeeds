// routes/presales.js
const express = require('express');
const { getPresales, getPresaleById } = require('../services/presalesService');
const router = express.Router();

// GET /api/presales?status=active
router.get('/', (req, res) => {
  const { status } = req.query;
  res.json({ success: true, data: getPresales(status || null) });
});

// GET /api/presales/:id
router.get('/:id', (req, res) => {
  const item = getPresaleById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: item });
});

module.exports = router;
