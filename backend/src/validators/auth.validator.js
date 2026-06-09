const { z } = require('zod');

// ── Signup Schema ──
const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['buyer', 'seller', 'admin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be buyer, seller, or admin',
  }),
  phone: z.string().optional(),
  storeName: z.string().min(2, 'Store name must be at least 2 characters').optional(),
}).refine(
  (data) => {
    // If role is seller, storeName is required
    if (data.role === 'seller' && !data.storeName) {
      return false;
    }
    return true;
  },
  {
    message: 'Store name is required for seller accounts',
    path: ['storeName'],
  }
);

// ── Login Schema ──
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  role: z.enum(['buyer', 'seller', 'admin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be buyer, seller, or admin',
  }),
});

// ── Refresh Token Schema ──
const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

// ── Update Profile Schema ──
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim().optional(),
  profile_image: z.string().url().optional(),
  profile: z.record(z.any()).optional(), // Allow role-specific profile updates
});

// ── Forgot Password Schema ──
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

// ── Reset Password Schema ──
const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Reset token is required' })
    .min(1, 'Reset token is required'),
  password: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
