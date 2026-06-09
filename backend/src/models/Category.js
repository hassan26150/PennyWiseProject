const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
