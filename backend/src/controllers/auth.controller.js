const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return ApiResponse.created(res, 'Account created successfully. Please login.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const deviceInfo = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    const result = await authService.login({
      ...req.body,
      deviceInfo,
      ipAddress,
    });

    return ApiResponse.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const deviceInfo = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    const result = await authService.refreshTokens({
      refreshToken: req.body.refreshToken,
      deviceInfo,
      ipAddress,
    });

    return ApiResponse.success(res, 'Token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return ApiResponse.success(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return ApiResponse.success(res, 'Profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return ApiResponse.success(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return ApiResponse.success(res, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return ApiResponse.success(res, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
