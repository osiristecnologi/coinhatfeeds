// routes/alpha.js
const express = require('express');
const { getAlpha } = require('../services/alphaService');
const router = express.Router();

// GET /api/alpha
router.get('/', (req, res) => {
  res.json({ success: true, data: getAlpha() });
});

module.exports = router;
