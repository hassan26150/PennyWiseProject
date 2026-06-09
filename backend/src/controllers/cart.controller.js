const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/cart
 * Return current buyer's cart
 */
const getCart = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    let cart = await Cart.findOne({ buyer_id: buyerId }).populate('items.product_id', 'name price thumbnail seller_id availability_source');
    
    if (!cart) {
      cart = await Cart.create({ buyer_id: buyerId, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/items
 * Add item to cart
 */
const addToCart = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity < 1) {
      return next(ApiError.badRequest('Valid product_id and quantity are required'));
    }

    // 1. Verify product exists and is a native PennyWise product
    const product = await Product.findById(product_id);
    if (!product) {
      return next(ApiError.notFound('Product not found'));
    }

    if (product.availability_source === 'external') {
      return next(ApiError.forbidden('This product must be purchased from the external store.'));
    }

    if (product.status !== 'approved' && product.status !== 'active') {
      return next(ApiError.badRequest('This product is not currently available for purchase.'));
    }

    if (product.stock_quantity < quantity) {
      return next(ApiError.badRequest(`Only ${product.stock_quantity} items in stock.`));
    }

    // 2. Find or create cart
    let cart = await Cart.findOne({ buyer_id: buyerId });
    if (!cart) {
      cart = new Cart({ buyer_id: buyerId, items: [] });
    }

    // 3. Add or update item
    const existingItemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        return next(ApiError.badRequest(`Cannot add ${quantity} more. Only ${product.stock_quantity} items in total stock.`));
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      // Update price snapshot to current price
      cart.items[existingItemIndex].price_snapshot = product.price;
    } else {
      // Add new item
      cart.items.push({
        product_id,
        quantity,
        price_snapshot: product.price,
      });
    }

    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product_id', 'name price thumbnail seller_id availability_source');
    
    res.status(200).json({ success: true, message: 'Item added to cart', data: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/cart/items/:itemId
 * Update quantity
 */
const updateCartItem = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return next(ApiError.badRequest('Quantity must be at least 1'));
    }

    const cart = await Cart.findOne({ buyer_id: buyerId });
    if (!cart) return next(ApiError.notFound('Cart not found'));

    const item = cart.items.id(itemId);
    if (!item) return next(ApiError.notFound('Item not found in cart'));

    const product = await Product.findById(item.product_id);
    if (product && quantity > product.stock_quantity) {
      return next(ApiError.badRequest(`Only ${product.stock_quantity} items in stock.`));
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product_id', 'name price thumbnail seller_id availability_source');
    res.json({ success: true, message: 'Cart updated', data: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/items/:itemId
 * Remove item
 */
const removeCartItem = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ buyer_id: buyerId });
    if (!cart) return next(ApiError.notFound('Cart not found'));

    cart.items.pull({ _id: itemId });
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product_id', 'name price thumbnail seller_id availability_source');
    res.json({ success: true, message: 'Item removed', data: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Clear entire cart
 */
const clearCart = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    await Cart.findOneAndUpdate({ buyer_id: buyerId }, { items: [] });
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
