const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All order routes require buyer authentication
router.use(authenticate);
router.use(authorize('buyer'));

router.post('/', orderController.checkout);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetails);
router.delete('/:id', orderController.cancelOrder);
router.get('/:id/invoice', orderController.getOrderInvoice);

module.exports = router;
