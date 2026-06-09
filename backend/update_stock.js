const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  const Product = require('./src/models/Product');
  const result = await Product.updateMany({ stock_quantity: 0 }, { $set: { stock_quantity: 10 } });
  console.log('Updated:', result.modifiedCount);
  process.exit(0);
})
.catch(e => {
  console.error(e);
  process.exit(1);
});
