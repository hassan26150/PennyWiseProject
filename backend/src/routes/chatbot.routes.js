const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { createLimiter } = require('../middleware/rateLimiter');
const { queryChatbot, clearSession } = require('../controllers/chatbot.controller');

const router = express.Router();

// Allow buyers to use the AI assistant
// router.use(authenticate);
// router.use(authorize('buyer'));

// Rate limit: 30 AI queries per 15 minutes per IP
router.post('/query', createLimiter(30, 15), queryChatbot);
router.delete('/session/:id', clearSession);

module.exports = router;
