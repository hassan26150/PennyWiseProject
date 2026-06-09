const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparison.controller');

// =======================
// PRICE COMPARISON ROUTES
// =======================

// Public — any user can view price comparisons
router.get('/:id/compare-prices', comparisonController.getComparePrices);
router.get('/:id/price-history', comparisonController.getPriceHistory);

module.exports = router;
