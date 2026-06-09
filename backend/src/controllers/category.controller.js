const Category = require('../models/Category');

/**
 * Get all categories (Supports hierarchical structure)
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    
    // Build tree structure
    const categoryMap = {};
    const roots = [];

    categories.forEach((cat) => {
      cat.children = [];
      categoryMap[cat._id.toString()] = cat;
    });

    categories.forEach((cat) => {
      if (cat.parent_id) {
        if (categoryMap[cat.parent_id.toString()]) {
          categoryMap[cat.parent_id.toString()].children.push(cat);
        }
      } else {
        roots.push(cat);
      }
    });

    res.json({
      success: true,
      data: roots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Create a new category (Admin only)
 * POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id, description } = req.body;
    
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category slug already exists' });
    }

    const category = new Category({
      name,
      slug,
      parent_id: parent_id || null,
      description,
    });

    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
};
