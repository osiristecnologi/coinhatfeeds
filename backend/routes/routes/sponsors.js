// routes/sponsors.js
const express = require('express');
const { getSponsors } = require('../services/sponsorsService');
const router = express.Router();

// GET /api/sponsors?tier=gold
router.get('/', (req, res) => {
  const { tier } = req.query;
  res.json({ success: true, data: getSponsors(tier || null) });
});

module.exports = router;
