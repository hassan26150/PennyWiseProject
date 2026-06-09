const express = require('express');
const router = express.Router();
const sellerOrderController = require('../controllers/seller.order.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require seller authentication
router.use(authenticate);
router.use(authorize('seller'));

router.get('/', sellerOrderController.getSellerOrders);
router.patch('/:id/confirm', sellerOrderController.confirmOrder);
router.patch('/:id/process', sellerOrderController.processOrder);
router.patch('/:id/ship', sellerOrderController.shipOrder);
router.patch('/:id/deliver', sellerOrderController.deliverOrder);
router.patch('/:id/cancel', sellerOrderController.cancelOrder);

module.exports = router;
