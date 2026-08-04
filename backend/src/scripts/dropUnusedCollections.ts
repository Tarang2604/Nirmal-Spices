/**
 * Drop MongoDB collections that are not part of the current app models.
 * Keep: users, products, categories, orders, carts, coupons, otps,
 *       reviews, newsletters, auditlogs, storesettings
 *
 * Usage: npx ts-node --transpile-only src/scripts/dropUnusedCollections.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env';

/** Mongoose default pluralized collection names for current models */
const KEEP = new Set([
  'users',
  'products',
  'categories',
  'orders',
  'carts',
  'coupons',
  'otps',
  'reviews',
  'newsletters',
  'auditlogs',
  'storesettings',
  // system
  'system.buckets',
  'system.views',
]);

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  const cols = await db.listCollections().toArray();
  const names = cols.map((c) => c.name).sort();

  console.log('Collections found:', names.join(', ') || '(none)');

  const unused = names.filter((n) => !KEEP.has(n) && !n.startsWith('system.'));

  if (unused.length === 0) {
    console.log('No unused collections to drop.');
    await mongoose.disconnect();
    return;
  }

  console.log('Dropping unused:', unused.join(', '));
  for (const name of unused) {
    await db.dropCollection(name);
    console.log(`  dropped: ${name}`);
  }

  const after = (await db.listCollections().toArray()).map((c) => c.name).sort();
  console.log('Remaining:', after.join(', '));
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
