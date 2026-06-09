const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Requires buyer authentication
router.use(authenticate);
router.use(authorize('buyer'));

router.post('/external-click', analyticsController.trackExternalClick);
router.post('/view', analyticsController.trackView);
router.post('/search', analyticsController.trackSearch);

module.exports = router;
