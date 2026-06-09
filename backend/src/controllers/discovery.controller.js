/**
 * PennyWise — Discovery Controller
 * Ingests products from the Python scraper microservice and maintains the Master Catalog.
 */

const MasterProduct = require('../models/MasterProduct');
const ExternalProduct = require('../models/ExternalProduct');
const ExternalPriceHistory = require('../models/ExternalPriceHistory');

// A simple local fuzzy matching helper. The Python side does heavy fuzzy matching, 
// but we do a quick check here based on exact normalized title or text search.
const findExistingMaster = async (normalizedTitle) => {
  // Try exact match on normalized title first
  let master = await MasterProduct.findOne({ normalized_title: normalizedTitle });
  if (master) return master;

  // Try text search as fallback
  const textResults = await MasterProduct.find(
    { $text: { $search: normalizedTitle } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(1);

  if (textResults.length > 0 && textResults[0].score > 2) {
    return textResults[0];
  }

  return null;
};

/**
 * POST /api/discovery/ingest
 * Receives a list of scraped products and updates the master catalog.
 */
const ingestProducts = async (req, res) => {
  try {
    const { platform, products } = req.body;

    if (!platform || !products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of products) {
      if (!item.product_name || !item.price || !item.url) continue;

      // Basic normalization
      const normalizedTitle = item.product_name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

      // Find or create Master Product
      let master = await findExistingMaster(normalizedTitle);

      if (!master) {
        // Create new Master Product
        master = new MasterProduct({
          name: item.product_name,
          normalized_title: normalizedTitle,
          brand: item.brand || 'Unknown',
          description: item.description || '',
          thumbnail: item.image_url || null,
          images: item.image_url ? [item.image_url] : [],
          lowest_market_price: item.price,
          average_market_price: item.price,
          best_platform: platform,
          average_rating: item.rating || 0,
          total_reviews: item.reviews || 0,
          last_discovered_at: new Date(),
        });
        await master.save();
        createdCount++;
      } else {
        // Update existing Master Product stats
        master.last_discovered_at = new Date();
        
        // If the new item has a better image and we don't have one
        if (item.image_url && !master.thumbnail) {
          master.thumbnail = item.image_url;
          master.images.push(item.image_url);
        }

        // We will recalculate prices below after saving ExternalProduct
        await master.save();
        updatedCount++;
      }

      // Upsert External Product
      const externalProduct = await ExternalProduct.findOneAndUpdate(
        {
          master_product_id: master._id,
          platform: platform,
          external_url: item.url,
        },
        {
          product_name: item.product_name,
          external_price: item.price,
          currency: item.currency || 'PKR',
          availability: item.in_stock !== undefined ? item.in_stock : true,
          in_stock: item.in_stock !== undefined ? item.in_stock : true,
          rating: item.rating || null,
          source_platform: platform,
          image_url: item.image_url,
          last_scraped_at: new Date(),
        },
        { upsert: true, new: true }
      );

      // Record History
      await ExternalPriceHistory.create({
        master_product_id: master._id,
        external_product_id: externalProduct._id,
        platform: platform,
        price: item.price,
      });

      // Recalculate Master Product market prices
      const allExternal = await ExternalProduct.find({ master_product_id: master._id });
      const prices = allExternal.map(ep => ep.external_price).filter(Boolean);
      
      if (prices.length > 0) {
        master.lowest_market_price = Math.min(...prices);
        master.average_market_price = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        
        // Find best platform
        const best = allExternal.find(ep => ep.external_price === master.lowest_market_price);
        if (best) master.best_platform = best.platform;
        
        await master.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Ingested ${products.length} products from ${platform}`,
      stats: { created: createdCount, updated: updatedCount }
    });
  } catch (error) {
    console.error('Ingest error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  ingestProducts,
};
