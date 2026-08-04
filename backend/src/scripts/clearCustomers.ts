/**
 * Clear all customer (role=user) accounts from MongoDB.
 * Keeps the admin account. Also clears carts linked to deleted users.
 * Usage: npx ts-node --transpile-only src/scripts/clearCustomers.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Cart } from '../models/Cart';
import { OTP } from '../models/OTP';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const customers = await User.find({ role: 'user' }).select('_id email').lean();
  const ids = customers.map((u) => u._id);

  console.log(`Found ${customers.length} customer account(s) to delete`);

  if (ids.length) {
    const cartResult = await Cart.deleteMany({ userId: { $in: ids } });
    console.log(`Carts deleted: ${cartResult.deletedCount}`);

    const emails = customers.map((u) => u.email).filter(Boolean);
    if (emails.length) {
      const otpResult = await OTP.deleteMany({ identifier: { $in: emails } });
      console.log(`OTP records deleted: ${otpResult.deletedCount}`);
    }

    const userResult = await User.deleteMany({ role: 'user' });
    console.log(`Customers deleted: ${userResult.deletedCount}`);
  } else {
    console.log('No customers to delete');
  }

  const adminCount = await User.countDocuments({ role: 'admin' });
  const remainingUsers = await User.countDocuments({ role: 'user' });
  console.log(`Admins remaining: ${adminCount}`);
  console.log(`Customers remaining: ${remainingUsers}`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
