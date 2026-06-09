const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { openDispute, getDisputes, getDisputeDetails, addMessage, resolveDispute } = require('../controllers/dispute.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('buyer'), openDispute);
router.get('/', getDisputes);
router.get('/:id', getDisputeDetails);
router.post('/:id/messages', addMessage);

router.patch('/:id/resolve', authorize('admin'), resolveDispute);

module.exports = router;
