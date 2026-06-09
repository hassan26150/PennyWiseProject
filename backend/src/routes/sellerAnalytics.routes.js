const express = require('express');
const { getOverview, getRevenue, getTopProducts, getMarketComparison, getDiscovery, getTrustAnalytics } = require('../controllers/sellerAnalytics.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize('seller'));

router.get('/overview', getOverview);
router.get('/revenue', getRevenue);
router.get('/top-products', getTopProducts);
router.get('/market-comparison/:productId', getMarketComparison);
router.get('/discovery', getDiscovery);
router.get('/trust', getTrustAnalytics);

module.exports = router;
