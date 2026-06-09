const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Public
router.get('/', categoryController.getCategories);

// Admin only
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);

module.exports = router;
