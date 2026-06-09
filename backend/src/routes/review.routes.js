const express = require('express');
const { submitReview, getProductReviews, getSellerReviews } = require('../controllers/review.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/products/:id', getProductReviews);
router.get('/sellers/:id', getSellerReviews);

// Buyers only can submit reviews
router.post('/', authenticate, authorize('buyer'), submitReview);

module.exports = router;
