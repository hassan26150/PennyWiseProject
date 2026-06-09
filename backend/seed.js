const mongoose = require('mongoose');
require('dotenv').config();
const MasterProduct = require('./src/models/MasterProduct');
const ExternalProduct = require('./src/models/ExternalProduct');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const master = await MasterProduct.create({
    name: 'Apple iPhone 15 Pro Max',
    normalized_title: 'apple iphone 15 pro max',
    brand: 'Apple',
    lowest_market_price: 350000,
    average_market_price: 360000,
    best_platform: 'Daraz',
    thumbnail: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  });
  console.log('Created MasterProduct:', master._id);

  await ExternalProduct.create({
    master_product_id: master._id,
    platform: 'Daraz',
    product_name: 'Apple iPhone 15 Pro Max 256GB',
    external_price: 350000,
    external_url: 'https://daraz.pk',
    image_url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  });
  console.log('Created ExternalProduct');
  process.exit(0);
});
