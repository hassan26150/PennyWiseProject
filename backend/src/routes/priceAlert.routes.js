const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getAlerts,
  createAlert,
  deleteAlert,
} = require('../controllers/priceAlert.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('buyer'));

router.get('/', getAlerts);
router.post('/', createAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
