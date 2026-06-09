/**
 * PennyWise — Price Comparison Controller
 * Handles compare-prices and price-history API endpoints.
 * Communicates with the Python scraper microservice.
 */

const Product = require('../models/Product');
const MasterProduct = require('../models/MasterProduct');
const ExternalProduct = require('../models/ExternalProduct');
const ExternalPriceHistory = require('../models/ExternalPriceHistory');
const ProductPriceHistory = require('../models/ProductPriceHistory');

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/products/:id/compare-prices
 * Get price comparison data for a product across all platforms.
 */
const getComparePrices = async (req, res) => {
  try {
    const id = req.params.id;

    let product = await MasterProduct.findById(id).lean();
    let isMaster = true;

    if (!product) {
      product = await Product.findById(id).populate('seller_id', 'store_name').lean();
      isMaster = false;
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Determine query name and price
    const productName = product.name;
    const basePrice = isMaster ? (product.lowest_market_price || product.average_market_price || 0) : product.price;
    const masterId = isMaster ? product._id : product.master_product_id;

    // Try to get fresh data from the scraper service
    let scraperResults = [];
    let scraperError = null;

    try {
      const response = await fetch(`${SCRAPER_URL}/scrape/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName }),
      });

      if (response.ok) {
        const data = await response.json();
        scraperResults = data.results || [];
      } else {
        scraperError = `Scraper returned ${response.status}`;
      }
    } catch (err) {
      scraperError = `Scraper unavailable: ${err.message}`;
      console.warn('⚠️  Scraper service unavailable, using cached DB data');
    }

    // Store/update results in MongoDB
    if (scraperResults.length > 0 && masterId) {
      for (const result of scraperResults) {
        try {
          const externalProduct = await ExternalProduct.findOneAndUpdate(
            {
              master_product_id: masterId,
              platform: result.platform,
              external_url: result.url,
            },
            {
              product_name: result.product_name,
              external_price: result.price,
              currency: result.currency || 'PKR',
              availability: result.in_stock,
              in_stock: result.in_stock,
              rating: result.rating,
              match_score: result.match_score,
              source_platform: result.platform,
              scrape_status: 'success',
              image_url: result.image_url,
              last_scraped_at: new Date(),
            },
            { upsert: true, new: true }
          );

          await ExternalPriceHistory.create({
            external_product_id: externalProduct._id,
            master_product_id: masterId,
            platform: result.platform,
            price: result.price,
          });
        } catch (dbErr) {
          console.warn(`DB update error for ${result.platform}:`, dbErr.message);
        }
      }
    }

    // Fetch all external products for this product from DB
    const externalQuery = masterId ? { master_product_id: masterId } : { product_id: id };
    const externalProducts = await ExternalProduct.find(externalQuery).sort({ external_price: 1 });

    const comparisons = externalProducts.map((ep) => ({
      platform: ep.platform,
      product_name: ep.product_name,
      price: ep.external_price,
      url: ep.external_url,
      in_stock: ep.in_stock,
      rating: ep.rating,
      match_score: ep.match_score,
      image_url: ep.image_url,
      last_updated: ep.last_scraped_at,
    }));

    // If it's a seller product or if a MasterProduct has PennyWise offers, include them.
    let pennyWiseOffers = [];
    if (!isMaster) {
      pennyWiseOffers.push({
        platform: 'PennyWise',
        product_name: product.name,
        price: product.price,
        url: null,
        in_stock: product.stock_quantity > 0,
        rating: product.average_rating,
        match_score: 100,
        image_url: product.thumbnail,
        last_updated: product.updatedAt,
      });
    } else {
      const sellers = await Product.find({ master_product_id: masterId, status: 'approved' }).populate('seller_id', 'store_name');
      pennyWiseOffers = sellers.map(s => ({
        platform: `PennyWise (${s.seller_id?.store_name || 'Seller'})`,
        product_name: s.name,
        price: s.price,
        url: null,
        in_stock: s.stock_quantity > 0,
        rating: s.average_rating,
        match_score: 100,
        image_url: s.thumbnail,
        last_updated: s.updatedAt,
      }));
    }

    const allComparisons = [...pennyWiseOffers, ...comparisons].sort((a, b) => a.price - b.price);

    // Calculate market stats
    const allPrices = allComparisons.map((c) => c.price).filter(Boolean);
    const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : basePrice;
    const highestPrice = allPrices.length > 0 ? Math.max(...allPrices) : basePrice;
    const averagePrice = allPrices.length > 0 ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : basePrice;

    const bestPlatform = allComparisons.length > 0 ? allComparisons[0].platform : 'PennyWise';

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          price: basePrice,
          thumbnail: product.thumbnail,
        },
        comparisons: allComparisons,
        stats: {
          lowestPrice,
          highestPrice,
          averagePrice,
          bestPlatform,
          totalPlatforms: new Set(allComparisons.map(c => c.platform)).size,
          savings: averagePrice > lowestPrice ? averagePrice - lowestPrice : 0,
        },
        scraperStatus: scraperError ? 'partial' : 'success',
        scraperError,
      },
    });
  } catch (error) {
    console.error('Compare prices error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


/**
 * GET /api/products/:id/price-history
 * Get price history for charts (PennyWise + external platforms).
 */
const getPriceHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const days = parseInt(req.query.days) || 30;

    let isMaster = true;
    let product = await MasterProduct.findById(id).lean();
    if (!product) {
      product = await Product.findById(id).lean();
      isMaster = false;
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const masterId = isMaster ? product._id : product.master_product_id;

    // Get PennyWise price history (from actual seller products)
    let internalQuery = masterId ? { product_id: { $in: await Product.find({ master_product_id: masterId }).distinct('_id') } } : { product_id: id };
    internalQuery.recorded_at = { $gte: sinceDate };

    const internalHistory = await ProductPriceHistory.find(internalQuery).sort({ recorded_at: 1 });

    // Get external price history
    const externalQuery = masterId ? { master_product_id: masterId } : { product_id: id };
    externalQuery.recorded_at = { $gte: sinceDate };
    const externalHistory = await ExternalPriceHistory.find(externalQuery).sort({ recorded_at: 1 });

    // Group external history by platform
    const platformHistory = {};
    for (const entry of externalHistory) {
      if (!platformHistory[entry.platform]) {
        platformHistory[entry.platform] = [];
      }
      platformHistory[entry.platform].push({
        price: entry.price,
        date: entry.recorded_at,
      });
    }

    // Build PennyWise price timeline
    const pennyWiseTimeline = internalHistory.map((h) => ({
      price: h.new_price,
      date: h.recorded_at,
    }));

    const currentPrice = isMaster ? (product.lowest_market_price || product.average_market_price || 0) : product.price;

    if (pennyWiseTimeline.length === 0 && !isMaster) {
      pennyWiseTimeline.push({
        price: currentPrice,
        date: product.createdAt || new Date(),
      });
    }

    res.json({
      success: true,
      data: {
        days,
        pennywise: pennyWiseTimeline,
        platforms: platformHistory,
        currentPrice: currentPrice,
      },
    });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getComparePrices,
  getPriceHistory,
};
