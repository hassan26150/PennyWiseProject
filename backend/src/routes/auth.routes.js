const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  signupSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

// ── Public routes ──
router.post('/signup',          validate(signupSchema),          authController.signup);
router.post('/login',           authLimiter, validate(loginSchema),  authController.login);
router.post('/refresh',         validate(refreshSchema),         authController.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),   authController.resetPassword);

// ── Protected routes ──
router.post('/logout',  authenticate, authController.logout);
router.get('/me',       authenticate, authController.getProfile);
router.put('/me',       authenticate, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
