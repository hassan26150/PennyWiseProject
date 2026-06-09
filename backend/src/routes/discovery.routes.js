const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');

// =======================
// DISCOVERY ROUTES (Internal Scraper API)
// =======================

// API key middleware for scraper authentication
const scraperAuth = (req, res, next) => {
  const apiKey = req.headers['x-scraper-api-key'];
  const expectedKey = process.env.SCRAPER_API_KEY || 'pennywise-scraper-internal-key';
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing scraper API key' });
  }
  next();
};

// Used by the Python Scraper to push discovered products to the Master Catalog
router.post('/ingest', scraperAuth, discoveryController.ingestProducts);

module.exports = router;
