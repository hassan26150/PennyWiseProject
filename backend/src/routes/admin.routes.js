const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('admin'));

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Seller Management
router.get('/sellers/pending', adminController.getPendingSellers);
router.patch('/sellers/:id/approve', adminController.approveSeller);
router.patch('/sellers/:id/reject', adminController.rejectSeller);

// Product Moderation
router.get('/products/pending', adminController.getPendingProducts);
router.patch('/products/:id/approve', adminController.approveProduct);
router.patch('/products/:id/reject', adminController.rejectProduct);

// Dispute Management
router.get('/disputes', adminController.getDisputes);
router.patch('/disputes/:id/resolve', adminController.resolveDispute);

// Scraper & System
router.get('/scrapers/status', adminController.getScraperStatus);
router.post('/notifications/broadcast', adminController.broadcastNotification);

module.exports = router;
