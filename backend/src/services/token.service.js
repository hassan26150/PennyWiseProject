const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Session = require('../models/Session');

/**
 * Generate short-lived access token (15 min).
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      email: user.email,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

/**
 * Generate long-lived refresh token (7 days).
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
};

/**
 * Verify access token. Returns decoded payload or throws.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify refresh token. Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Create a new session (stores refresh token in DB).
 */
const createSession = async (userId, refreshToken, deviceInfo = '', ipAddress = '') => {
  // Calculate expiry from JWT_REFRESH_EXPIRY string (e.g., '7d')
  const expiryMs = parseExpiry(env.JWT_REFRESH_EXPIRY);
  const expiresAt = new Date(Date.now() + expiryMs);

  const session = await Session.create({
    user_id: userId,
    refresh_token: refreshToken,
    device_info: deviceInfo,
    ip_address: ipAddress,
    expires_at: expiresAt,
  });

  return session;
};

/**
 * Delete a single session by refresh token.
 */
const deleteSession = async (refreshToken) => {
  return Session.deleteOne({ refresh_token: refreshToken });
};

/**
 * Delete all sessions for a user.
 */
const deleteAllUserSessions = async (userId) => {
  return Session.deleteMany({ user_id: userId });
};

/**
 * Rotate refresh token: delete old, issue new, create new session.
 */
const rotateRefreshToken = async (oldRefreshToken, userId, deviceInfo, ipAddress) => {
  // Delete old session
  await deleteSession(oldRefreshToken);

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken({ _id: userId });

  // Create new session
  await createSession(userId, newRefreshToken, deviceInfo, ipAddress);

  return newRefreshToken;
};

/**
 * Parse expiry string (e.g., '15m', '7d', '30d') to milliseconds.
 */
const parseExpiry = (expiry) => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createSession,
  deleteSession,
  deleteAllUserSessions,
  rotateRefreshToken,
};
