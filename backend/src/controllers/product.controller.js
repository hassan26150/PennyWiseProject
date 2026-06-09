const Product = require('../models/Product');
const MasterProduct = require('../models/MasterProduct');
const ProductPriceHistory = require('../models/ProductPriceHistory');
const Favorite = require('../models/Favorite');
const PriceAlert = require('../models/PriceAlert');
const notificationService = require('../services/notification.service');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

// ==========================================
// SELLER APIs
// ==========================================

/**
 * POST /api/products
 * Seller creates a new product
 */
const createProduct = async (req, res) => {
  try {
    // Validate inputs
    const validatedData = createProductSchema.parse(req.body);
    
    let images = [];
    let thumbnail = null;

    // Handle Image Uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      images = uploadResults.map((result) => result.secure_url);
      if (images.length > 0) {
        thumbnail = images[0];
      }
    }

    // Generate unique slug
    const baseSlug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${Date.now()}`;

    // Parse attributes if provided as JSON string
    let parsedAttributes = {};
    if (validatedData.attributes) {
      try {
        parsedAttributes = JSON.parse(validatedData.attributes);
      } catch (e) {
        console.warn('Failed to parse attributes JSON');
      }
    }

    const mongoose = require('mongoose');
    const Category = require('../models/Category');
    
    let categoryId = validatedData.category_id;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      // It's not a valid ObjectId, assume it's a new category name from the seller
      let existingCat = await Category.findOne({ name: { $regex: new RegExp(`^${categoryId}$`, 'i') } });
      if (!existingCat) {
        existingCat = await Category.create({ 
          name: categoryId, 
          slug: `${categoryId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
        });
      }
      categoryId = existingCat._id;
    }

    const normalizedTitle = validatedData.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    
    // Find or create Master Product
    let master = await MasterProduct.findOne({ normalized_title: normalizedTitle });
    if (!master) {
      const textResults = await MasterProduct.find(
        { $text: { $search: normalizedTitle } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(1);
      
      if (textResults.length > 0 && textResults[0].score > 2) {
        master = textResults[0];
      }
    }

    if (!master) {
      master = new MasterProduct({
        name: validatedData.name,
        normalized_title: normalizedTitle,
        category_id: categoryId,
        description: validatedData.description,
        thumbnail,
        images,
        lowest_market_price: validatedData.price,
        average_market_price: validatedData.price,
        best_platform: 'PennyWise',
      });
      await master.save();
    } else {
      // Update lowest price if this seller is cheaper
      if (validatedData.price < master.lowest_market_price || master.lowest_market_price === 0) {
        master.lowest_market_price = validatedData.price;
        master.best_platform = 'PennyWise';
        await master.save();
      }
    }

    const newProduct = new Product({
      seller_id: req.user.id, // from auth middleware
      master_product_id: master._id,
      category_id: categoryId,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      short_description: validatedData.short_description || '',
      price: validatedData.price,
      stock_quantity: validatedData.stock_quantity,
      images,
      thumbnail,
      attributes: parsedAttributes,
      status: 'pending', // Requires admin approval
    });

    await newProduct.save();

    // Create initial price history
    await ProductPriceHistory.create({
      product_id: newProduct._id,
      old_price: newProduct.price,
      new_price: newProduct.price,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully and is pending approval',
      data: newProduct,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/products/mine
 * Get logged-in seller's products
 */
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller_id: req.user.id }).sort({ created_at: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/products/:id
 * Update a seller's product
 */
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId, seller_id: req.user.id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const validatedData = updateProductSchema.parse(req.body);

    // Track price change for history and price drop alerts
    if (validatedData.price && validatedData.price !== product.price) {
      const oldPrice = product.price;
      const newPrice = validatedData.price;
      
      await ProductPriceHistory.create({
        product_id: product._id,
        old_price: oldPrice,
        new_price: newPrice,
      });

      // Price Drop Alert & Price Alerts checks
      if (newPrice < oldPrice && product.master_product_id) {
        // 1. General Price Drop Alert (Favorites)
        const dropPercentage = ((oldPrice - newPrice) / oldPrice) * 100;
        if (dropPercentage >= 5) {
          const favorites = await Favorite.find({ product_id: product.master_product_id });
          if (favorites.length > 0) {
            const userIds = favorites.map(f => f.user_id);
            notificationService.sendBatch(
              userIds,
              'price_drop',
              'Price Drop Alert! 📉',
              `${product.name} just dropped in price to PKR ${newPrice.toLocaleString()}!`,
              { product_id: product.master_product_id, screen: 'ProductDetail' }
            ).catch(err => console.error('Failed to send price drop batch', err));
          }
        }

        // 2. Target Price Alerts
        const activeAlerts = await PriceAlert.find({ 
          product_id: product.master_product_id, 
          active: true,
          target_price: { $gte: newPrice } // Only those whose target is met
        });
        
        if (activeAlerts.length > 0) {
          const alertUserIds = activeAlerts.map(a => a.buyer_id);
          notificationService.sendBatch(
            alertUserIds,
            'price_alert_met',
            'Target Price Reached! 🎯',
            `${product.name} is now available at your target price of PKR ${newPrice.toLocaleString()}!`,
            { product_id: product.master_product_id, screen: 'ProductDetail' }
          ).catch(err => console.error('Failed to send price alert batch', err));

          // Deactivate them so they don't spam
          await PriceAlert.updateMany(
            { _id: { $in: activeAlerts.map(a => a._id) } },
            { $set: { active: false } }
          );
        }
      }
    }

    // Low stock alert
    if (validatedData.stock_quantity !== undefined) {
      if (validatedData.stock_quantity <= 5 && product.stock_quantity > 5) {
        notificationService.send(
          product.seller_id,
          'low_stock_alert',
          'Low Stock Warning',
          `Your product "${product.name}" has only ${validatedData.stock_quantity} items left in stock.`,
          { product_id: product._id }
        ).catch(err => console.error('Failed to notify low stock', err));
      }
    }

    // Handle new images (optional appending)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map((result) => result.secure_url);
      product.images = [...product.images, ...newImages];
      if (!product.thumbnail && product.images.length > 0) {
        product.thumbnail = product.images[0];
      }
    }

    // Update fields
    Object.keys(validatedData).forEach((key) => {
      if (key === 'attributes' && validatedData.attributes) {
        try {
          product.attributes = JSON.parse(validatedData.attributes);
        } catch (e) {}
      } else if (validatedData[key] !== undefined) {
        product[key] = validatedData[key];
      }
    });

    await product.save();

    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/products/:id
 * Soft delete seller product
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller_id: req.user.id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.status = 'inactive';
    await product.save();

    res.json({ success: true, message: 'Product deleted (inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ==========================================
// PUBLIC / BUYER APIs
// ==========================================

/**
 * GET /api/products
 * Browse Master Catalog with filtering & pagination
 */
const getPublicProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const query = { is_active: true };

    if (category) query.category_id = category;
    if (minPrice || maxPrice) {
      query.lowest_market_price = {};
      if (minPrice) query.lowest_market_price.$gte = Number(minPrice);
      if (maxPrice) query.lowest_market_price.$lte = Number(maxPrice);
    }

    let sortOptions = { created_at: -1 }; // newest default
    if (sort === 'price_asc') sortOptions = { lowest_market_price: 1 };
    if (sort === 'price_desc') sortOptions = { lowest_market_price: -1 };
    if (sort === 'rating') sortOptions = { average_rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const masterProducts = await MasterProduct.find(query)
      .populate('category_id', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await MasterProduct.countDocuments(query);

    // Map to expected frontend format
    const formattedData = masterProducts.map(p => ({
      ...p,
      price: p.lowest_market_price || p.average_market_price || 0,
      source: 'external', // Discovery catalog
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/products/search
 * Full text search using MongoDB Text Index on Master Catalog
 */
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const masterProducts = await MasterProduct.find(
      { is_active: true, $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await MasterProduct.countDocuments({ is_active: true, $text: { $search: q } });

    const formattedData = masterProducts.map(p => ({
      ...p,
      price: p.lowest_market_price || p.average_market_price || 0,
      source: 'external',
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/products/:id
 * Get single Master Product details + associated PennyWise Marketplace offers
 */
const getProductDetails = async (req, res) => {
  try {
    // Attempt to find in Master Catalog first
    let product = await MasterProduct.findOneAndUpdate(
      { _id: req.params.id, is_active: true },
      { $inc: { total_views: 1 } },
      { new: true }
    )
      .populate('category_id', 'name slug')
      .lean();

    if (product) {
      product.price = product.lowest_market_price || product.average_market_price || 0;
      product.source = 'external';

      // Fetch internal marketplace offers (PennyWise sellers)
      const marketplaceOffers = await Product.find({ 
        master_product_id: product._id,
        status: 'approved'
      })
      .populate('seller_id', 'storeName name email')
      .lean();

      product.marketplaceOffers = marketplaceOffers;
    } else {
      // Fallback: If it's a direct PennyWise seller product ID (legacy link or direct link)
      product = await Product.findOneAndUpdate(
        { _id: req.params.id, status: 'approved' },
        { $inc: { total_views: 1 } },
        { new: true }
      )
        .populate('seller_id', 'storeName name email')
        .populate('category_id', 'name slug')
        .lean();
        
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      product.source = 'internal';
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  searchProducts,
  getProductDetails,
};
