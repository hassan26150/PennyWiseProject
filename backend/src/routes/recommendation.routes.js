const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { getRecommendations } = require('../controllers/recommendation.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('buyer'));

router.get('/', getRecommendations);

module.exports = router;
