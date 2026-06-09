const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All cart routes require buyer authentication
router.use(authenticate);
router.use(authorize('buyer'));

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
