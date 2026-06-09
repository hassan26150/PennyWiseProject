const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload.middleware');

// =======================
// PUBLIC / BUYER ROUTES
// =======================
router.get('/', productController.getPublicProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductDetails);

// =======================
// SELLER ROUTES
// =======================

// Note: /mine needs to come before /:id to prevent 'mine' being treated as an ID
router.get('/seller/mine', authenticate, authorize('seller'), productController.getMyProducts);

router.post(
  '/',
  authenticate,
  authorize('seller'),
  upload.array('images', 5), // allow up to 5 images
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('seller'),
  upload.array('images', 5),
  productController.updateProduct
);

router.delete('/:id', authenticate, authorize('seller'), productController.deleteProduct);

module.exports = router;
