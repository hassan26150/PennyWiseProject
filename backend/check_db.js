const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  const Product = require('./src/models/Product');
  const products = await Product.find({}, 'name status master_product_id').lean();
  console.log('All Products:', JSON.stringify(products, null, 2));
  
  const MasterProduct = require('./src/models/MasterProduct');
  const masters = await MasterProduct.find({}, 'name source').limit(3).lean();
  console.log('Sample Masters:', JSON.stringify(masters, null, 2));

  process.exit(0);
})
.catch(e => {
  console.error(e);
  process.exit(1);
});
