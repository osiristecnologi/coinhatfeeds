// routes/presales.js
const express = require('express');
const path = require('path');
const { getPresales, getPresaleById } = require(path.resolve(__dirname, '../services/presalesService.js'));
const router = express.Router();

// GET /api/presales?status=active
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    res.json({ success: true, data: getPresales(status || null) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/presales/:id
router.get('/:id', (req, res) => {
  try {
    const item = getPresaleById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
