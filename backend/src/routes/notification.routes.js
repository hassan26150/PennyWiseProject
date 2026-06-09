const express = require('express');
const authenticate = require('../middleware/authenticate');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
} = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/register-token', registerPushToken);

module.exports = router;
