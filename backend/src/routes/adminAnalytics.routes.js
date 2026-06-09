const express = require('express');
const { getOverview, getUserActivity, getPlatformGrowth, getProductDiscovery, getAIAnalytics, getDisputeAnalytics, generateReport } = require('../controllers/adminAnalytics.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/user-activity', getUserActivity);
router.get('/platform-growth', getPlatformGrowth);
router.get('/product-discovery', getProductDiscovery);
router.get('/ai-analytics', getAIAnalytics);
router.get('/disputes', getDisputeAnalytics);
router.get('/reports/generate', generateReport);

module.exports = router;
