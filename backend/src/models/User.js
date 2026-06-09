const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['buyer', 'seller', 'admin'],
        message: 'Role must be buyer, seller, or admin',
      },
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'pending', 'deactivated'],
        message: 'Status must be active, suspended, pending, or deactivated',
      },
      default: 'active',
    },
    phone: {
      type: String,
      trim: true,
    },
    profile_image: {
      type: String,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
    },
    reset_token: {
      type: String,
      select: false,
    },
    reset_token_expiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(doc, ret) {
        delete ret.password_hash;
        delete ret.reset_token;
        delete ret.reset_token_expiry;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Pre-save hook: hash password if modified ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance method: compare password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
