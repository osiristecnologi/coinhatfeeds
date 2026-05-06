// routes/airdrops.js
const express = require('express');
const { getAirdrops } = require('../services/airdropsService');
const router = express.Router();

// GET /api/airdrops?status=active
router.get('/', (req, res) => {
  const { status } = req.query;
  res.json({ success: true, data: getAirdrops(status || null) });
});

module.exports = router;
