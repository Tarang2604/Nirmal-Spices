const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nirmal-spices');
  const slugs = ['turmeric-powder-ground', 'kashmiri-mirch-powder', 'red-chilli-powder', 'coriander-powder-ground'];
  const list = await mongoose.connection.db.collection('products').find({ slug: { $in: slugs } }).toArray();
  list.forEach(p => {
    console.log('SLUG:', p.slug, '| NAME:', p.name, '| IMAGES:', p.images);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
