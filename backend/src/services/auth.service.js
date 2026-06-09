const crypto = require('crypto');
const User = require('../models/User');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');
const Session = require('../models/Session');
const tokenService = require('./token.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Sign up a new user with role-specific profile creation.
 */
const signup = async ({ name, email, password, role, phone, storeName }) => {
  // Check duplicate email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  // Create user (password hashed via pre-save hook)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password_hash: password,
    role,
    phone,
  });

  // Create role-specific profile
  switch (role) {
    case 'buyer':
      await Buyer.create({ user_id: user._id });
      break;
    case 'seller':
      if (!storeName) {
        // Clean up user if seller has no store name
        await User.findByIdAndDelete(user._id);
        throw ApiError.badRequest('Store name is required for seller accounts.');
      }
      await Seller.create({
        user_id: user._id,
        store_name: storeName,
      });
      break;
    case 'admin':
      await Admin.create({
        user_id: user._id,
        department: 'General',
        permissions: { full_access: true },
      });
      break;
  }

  logger.info(`New ${role} account created: ${email}`);

  // Return user without sensitive fields
  const userObj = user.toJSON();
  return userObj;
};

/**
 * Login: validate credentials, create session, return tokens.
 */
const login = async ({ email, password, role, deviceInfo, ipAddress }) => {
  // Find user with password field included
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');

  if (!user) {
    throw ApiError.unauthorized('Account not found. Please sign up first.');
  }

  // Validate role matches
  if (user.role !== role) {
    throw ApiError.unauthorized(`This account is registered as a ${user.role}. Please select the correct role.`);
  }

  // Check if account is suspended or deactivated
  if (user.status === 'suspended') {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }
  if (user.status === 'deactivated') {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support to reactivate.');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Generate tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);

  // Create session
  await tokenService.createSession(user._id, refreshToken, deviceInfo, ipAddress);

  // Update last login
  user.last_login = new Date();
  await user.save({ validateBeforeSave: false });

  // Get role-specific profile
  const profile = await getRoleProfile(user._id, user.role);

  return {
    accessToken,
    refreshToken,
    user: {
      ...user.toJSON(),
      profile,
    },
  };
};

/**
 * Refresh tokens: validate refresh token, rotate, return new tokens.
 */
const refreshTokens = async ({ refreshToken, deviceInfo, ipAddress }) => {
  // Verify the refresh token JWT
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please login again.');
  }

  // Check session exists in DB
  const session = await Session.findOne({ refresh_token: refreshToken, user_id: decoded.id });
  if (!session) {
    throw ApiError.unauthorized('Session not found. Please login again.');
  }

  // Get user
  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User not found.');
  }

  if (user.status === 'suspended') {
    await tokenService.deleteAllUserSessions(user._id);
    throw ApiError.forbidden('Your account has been suspended.');
  }

  // Generate new access token
  const newAccessToken = tokenService.generateAccessToken(user);

  // Rotate refresh token
  const newRefreshToken = await tokenService.rotateRefreshToken(
    refreshToken,
    user._id,
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout: delete session.
 */
const logout = async (refreshToken) => {
  if (refreshToken) {
    await tokenService.deleteSession(refreshToken);
  }
};

/**
 * Get authenticated user profile with role-specific data.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const profile = await getRoleProfile(user._id, user.role);

  return {
    ...user.toJSON(),
    profile,
  };
};

/**
 * Update user profile.
 */
const updateProfile = async (userId, updates) => {
  const profileUpdates = updates.profile;
  delete updates.profile;

  // Fields that cannot be updated via this endpoint
  const forbiddenFields = ['password_hash', 'role', 'status', 'email_verified', 'phone_verified', 'reset_token', 'reset_token_expiry'];
  for (const field of forbiddenFields) {
    delete updates[field];
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (profileUpdates && Object.keys(profileUpdates).length > 0) {
    if (user.role === 'buyer') {
      await Buyer.findOneAndUpdate({ user_id: user._id }, profileUpdates, { runValidators: true });
    } else if (user.role === 'seller') {
      await Seller.findOneAndUpdate({ user_id: user._id }, profileUpdates, { runValidators: true });
    }
  }

  const profile = await getRoleProfile(user._id, user.role);

  return {
    ...user.toJSON(),
    profile,
  };
};

/**
 * Forgot password: generate reset token.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if email exists (security)
    return { message: 'If this email is registered, a password reset link has been sent.' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.reset_token = resetTokenHash;
  user.reset_token_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with resetToken (not the hash)
  // In production: emailService.sendPasswordReset(user.email, resetToken)
  logger.info(`Password reset token generated for: ${email} — Token: ${resetToken}`);

  return { message: 'If this email is registered, a password reset link has been sent.' };
};

/**
 * Reset password using token.
 */
const resetPassword = async (token, newPassword) => {
  // Hash the token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    reset_token: tokenHash,
    reset_token_expiry: { $gt: new Date() },
  }).select('+reset_token +reset_token_expiry');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token.');
  }

  // Update password
  user.password_hash = newPassword; // Will be hashed by pre-save hook
  user.reset_token = undefined;
  user.reset_token_expiry = undefined;
  await user.save();

  // Invalidate all existing sessions
  await tokenService.deleteAllUserSessions(user._id);

  logger.info(`Password reset successful for: ${user.email}`);

  return { message: 'Password reset successful. Please login with your new password.' };
};

/**
 * Helper: get role-specific profile data.
 */
const getRoleProfile = async (userId, role) => {
  switch (role) {
    case 'buyer':
      return Buyer.findOne({ user_id: userId });
    case 'seller':
      return Seller.findOne({ user_id: userId });
    case 'admin':
      return Admin.findOne({ user_id: userId });
    default:
      return null;
  }
};

module.exports = {
  signup,
  login,
  refreshTokens,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
