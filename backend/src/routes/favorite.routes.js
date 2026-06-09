const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
} = require('../controllers/favorite.controller');

const router = express.Router();

// Only buyers can use favorites
router.use(authenticate);
router.use(authorize('buyer'));

router.get('/', getFavorites);
router.post('/:productId', addToFavorites);
router.delete('/:productId', removeFromFavorites);
router.get('/:productId/status', isFavorited);

module.exports = router;
