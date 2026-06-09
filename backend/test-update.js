const mongoose = require('mongoose');
const authService = require('./src/services/auth.service');
const User = require('./src/models/User');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pennywise', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('No seller found');
      return;
    }

    console.log('Found seller:', seller.email);

    const updates = {
      email: seller.email,
      phone: '123456789',
      profile: {
        store_name: 'Updated Store Name',
        store_location: 'Updated Location',
      }
    };

    const updated = await authService.updateProfile(seller._id, updates);
    console.log('Success:', updated);
  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
